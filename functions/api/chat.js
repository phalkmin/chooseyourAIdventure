import { Ai } from '@cloudflare/ai';

export async function onRequestPost(context) {
  const { request, env } = context;
  const ai = new Ai(env.AI);
  const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';

  // Rate limiting check
  const rateLimitResult = await checkRateLimit(env, clientIP);
  if (!rateLimitResult.allowed) {
    return new Response('Rate limit exceeded. Try again later.', { 
      status: 429,
      headers: {
        'Retry-After': '60',
        ...corsHeaders
      }
    });
  }

  // Validate request
  const contentType = request.headers.get('Content-Type');
  if (!contentType || !contentType.includes('application/json')) {
    return new Response('Content-Type must be application/json', { status: 400 });
  }

  let requestBody;
  try {
    requestBody = await request.json();
  } catch (error) {
    return new Response('Invalid JSON in request body', { status: 400 });
  }

  // Validate required fields
  if (!requestBody.messages || !Array.isArray(requestBody.messages)) {
    return new Response('messages field is required and must be an array', { status: 400 });
  }

  // Validate message format
  for (const message of requestBody.messages) {
    if (!message.role || !message.content) {
      return new Response('Each message must have role and content fields', { status: 400 });
    }
    if (!['user', 'assistant', 'system'].includes(message.role)) {
      return new Response('Message role must be user, assistant, or system', { status: 400 });
    }
  }

  const chatHistory = requestBody.messages;
  
  // Generate cache key from chat history
  const cacheKey = await generateCacheKey(chatHistory);
  
  // Check cache first
  if (env.CHAT_CACHE) {
    const cached = await env.CHAT_CACHE.get(cacheKey);
    if (cached) {
      return new Response(JSON.parse(cached), { headers: corsHeaders });
    }
  }

  // Stream response with modern implementation
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  // Process in background
  context.waitUntil((async () => {
    try {
      const stream = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
        max_tokens: 512,
        messages: chatHistory,
        stream: true,
        temperature: 0.8,
        top_p: 0.9
      });

      let fullResponse = '';
      
      // Process stream chunks
      for await (const chunk of stream) {
        if (chunk.response) {
          const data = `data: ${JSON.stringify({ text: chunk.response })}\n\n`;
          await writer.write(encoder.encode(data));
          fullResponse += chunk.response;
        }
      }

      // Send completion signal
      await writer.write(encoder.encode('data: [DONE]\n\n'));

      // Cache full response
      if (fullResponse && env.CHAT_CACHE) {
        await env.CHAT_CACHE.put(cacheKey, JSON.stringify({ response: fullResponse }), {
          expirationTtl: 3600 // 1 hour cache
        });
      }
    } catch (error) {
      console.error('Stream processing error:', error);
      const errorData = `data: ${JSON.stringify({ error: 'Processing failed' })}\n\n`;
      await writer.write(encoder.encode(errorData));
    } finally {
      await writer.close();
    }
  })());

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      ...corsHeaders
    }
  });
}

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block'
};

async function generateCacheKey(messages) {
  const msgString = JSON.stringify(messages);
  const encoder = new TextEncoder();
  const data = encoder.encode(msgString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function checkRateLimit(env, clientIP) {
  if (!env.RATE_LIMITER) return { allowed: true };
  
  const key = `rate_limit_${clientIP}`;
  const current = await env.RATE_LIMITER.get(key);
  const limit = 10; // requests per minute
  const window = 60; // seconds
  
  if (!current) {
    await env.RATE_LIMITER.put(key, '1', { expirationTtl: window });
    return { allowed: true };
  }
  
  const count = parseInt(current);
  if (count >= limit) {
    return { allowed: false };
  }
  
  await env.RATE_LIMITER.put(key, (count + 1).toString(), { expirationTtl: window });
  return { allowed: true };
}