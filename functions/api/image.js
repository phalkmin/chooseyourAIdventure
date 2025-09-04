import { Ai } from '@cloudflare/ai';

export async function onRequestPost(context) {
  const { request, env } = context;
  const ai = new Ai(env.AI);

  let requestBody;
  try {
    requestBody = await request.json();
  } catch (error) {
    return new Response('Invalid JSON in request body', { status: 400 });
  }

  // Validate prompt
  const prompt = requestBody.prompt || requestBody;
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return new Response('prompt is required and must be a non-empty string', { status: 400 });
  }

  // Validate prompt length
  if (prompt.length > 1000) {
    return new Response('prompt must be less than 1000 characters', { status: 400 });
  }
  
  // Add to queue if too many concurrent requests
  if (env.IMAGE_QUEUE) {
    const concurrentRequests = await env.IMAGE_QUEUE.get('concurrent');
    if (concurrentRequests > 5) {
      await env.IMAGE_QUEUE.put('request', JSON.stringify({
        prompt: requestBody,
        timestamp: Date.now()
      }));
      return new Response('Queued', { status: 202 });
    }
  }

  try {
    // Generate image with modern model
    const image = await ai.run('@cf/stabilityai/stable-diffusion-xl-base-1.0', {
      prompt: requestBody.prompt || requestBody,
      width: 512,
      height: 512,
      guidance_scale: 7.5,
      num_inference_steps: 20
    });

    return new Response(image, {
      headers: {
        'Content-Type': 'image/png',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Image generation error:', error);
    return new Response('Image generation failed', { 
      status: 500, 
      headers: corsHeaders 
    });
  }
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