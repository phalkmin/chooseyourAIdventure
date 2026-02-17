import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export const runtime = 'edge';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatBody {
  messages: Message[];
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatBody;

    if (!body.messages || !Array.isArray(body.messages)) {
      return new Response(
        JSON.stringify({
          error: 'messages field is required and must be an array',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get Cloudflare bindings via OpenNext
    const { env } = getCloudflareContext();

    // Priority 1: Cloudflare AI Binding
    if (env?.AI) {
      console.log('Using Cloudflare AI binding...');
      const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        max_tokens: 1024,
        messages: body.messages,
        temperature: 0.7,
      });

      return new Response(
        JSON.stringify({
          response: response.response || 'No response from AI',
          success: true,
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Priority 2: Cloudflare AI via REST API (for local development without wrangler)
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (accountId && apiToken) {
      console.log('Using Cloudflare AI via REST API...');
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.1-8b-instruct`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: body.messages,
            max_tokens: 1024,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        return new Response(
          JSON.stringify({
            response: result.result?.response || 'No response from AI API',
            success: true,
          }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      } else {
        const errorText = await response.text();
        console.error('Cloudflare AI API error:', errorText);
      }
    }

    // Fallback: Simulation
    console.log('AI binding/token not found, simulating response...');
    const lastUserMessage = body.messages
      .filter((msg) => msg.role === 'user')
      .pop();
    const simulatedResponse = simulateAIResponse(
      lastUserMessage ? lastUserMessage.content : ''
    );

    return new Response(
      JSON.stringify({
        response: simulatedResponse,
        success: true,
        simulated: true,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Processing failed', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

function simulateAIResponse(userMessage: string) {
  const responses = {
    default:
      'I am a simulated AI response for local development. Your message was: ' +
      userMessage,
    greeting:
      "Hello! I'm running in development mode. How can I help you with your adventure?",
    medieval:
      'Ah, brave adventurer! In this medieval realm, you find yourself standing before a great castle. What do you choose to do?',
    scifi:
      "Welcome to the future, space traveler! Your ship's AI systems are online. What is your next course of action?",
  };

  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return responses.greeting;
  } else if (
    lowerMessage.includes('medieval') ||
    lowerMessage.includes('castle') ||
    lowerMessage.includes('knight')
  ) {
    return responses.medieval;
  } else if (
    lowerMessage.includes('space') ||
    lowerMessage.includes('sci-fi') ||
    lowerMessage.includes('future')
  ) {
    return responses.scifi;
  } else {
    return responses.default;
  }
}
