import { Ai } from '@cloudflare/ai';

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    console.log('Chat API called');
    
    // Check if AI binding exists
    if (!env.AI) {
      console.error('AI binding not available');
      return new Response(JSON.stringify({ error: 'AI service not configured' }), { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), { 
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Validate messages
    if (!requestBody.messages || !Array.isArray(requestBody.messages)) {
      return new Response(JSON.stringify({ error: 'Messages array required' }), { 
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    console.log('Initializing AI...');
    const ai = new Ai(env.AI);
    
    console.log('Making AI request...');
    
    // Simple non-streaming response for testing
    const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
      max_tokens: 256,
      messages: requestBody.messages,
      temperature: 0.8
    });

    console.log('AI response received:', response);

    return new Response(JSON.stringify({ 
      response: response.response || 'No response from AI',
      success: true 
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: error.message,
      stack: error.stack 
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
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