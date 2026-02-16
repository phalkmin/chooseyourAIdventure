export const runtime = 'edge';

export default async function handler(req) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Allow': 'POST' }
    });
  }

  try {
    const body = await req.json();
    
    if (!body.messages || !Array.isArray(body.messages)) {
      return new Response(JSON.stringify({ error: 'messages field is required and must be an array' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Access Cloudflare environment bindings
    // In OpenNext/Cloudflare Pages, bindings are available on the request context
    // or sometimes via globalThis.process.env depending on configuration
    const env = req.context?.env || process.env;

    if (env && env.AI) {
      console.log('Using Cloudflare AI binding...');
      const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        max_tokens: 1024,
        messages: body.messages,
        temperature: 0.7
      });

      return new Response(JSON.stringify({ 
        response: response.response || 'No response from AI',
        success: true 
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fallback for local development if AI binding is not available
    console.log('AI binding not found, simulating response...');
    const lastUserMessage = body.messages.filter(msg => msg.role === 'user').pop();
    const simulatedResponse = await simulateAIResponse(lastUserMessage ? lastUserMessage.content : '');

    return new Response(JSON.stringify({ 
      response: simulatedResponse,
      success: true,
      simulated: true
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ error: 'Processing failed', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Simulate AI response for local development
async function simulateAIResponse(userMessage) {
  const responses = {
    default: "I am a simulated AI response for local development. Your message was: " + userMessage,
    greeting: "Hello! I'm running in development mode. How can I help you with your adventure?",
    medieval: "Ah, brave adventurer! In this medieval realm, you find yourself standing before a great castle. What do you choose to do?",
    scifi: "Welcome to the future, space traveler! Your ship's AI systems are online. What is your next course of action?"
  };

  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return responses.greeting;
  } else if (lowerMessage.includes('medieval') || lowerMessage.includes('castle') || lowerMessage.includes('knight')) {
    return responses.medieval;
  } else if (lowerMessage.includes('space') || lowerMessage.includes('sci-fi') || lowerMessage.includes('future')) {
    return responses.scifi;
  } else {
    return responses.default;
  }
}
