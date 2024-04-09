import { Ai } from './vendor/@cloudflare/ai.js';

export default {
  async fetch(request, env, ctx) {
    const ai = new Ai(env.AI);
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }


    if (url.pathname === '/chat') {
      try {
        const requestBody = await request.json();
        const chatHistory = requestBody.messages;

        const answer = await ai.run('@cf/meta/llama-2-7b-chat-fp16', { max_tokens : 300, messages: chatHistory });
        const response = new Response(JSON.stringify(answer), {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Content-Type': 'application/json',
          },
        });
        return response;
      } catch (error) {
        console.error('Error:', error);
        return new Response('Internal Server Error', { status: 500 });
      }
    }

    if (url.pathname === '/image') {
      try {
        const requestBody = await request.json();
        const inputs = {
          prompt: requestBody,
        };
  
        const ibagen = await ai.run('@cf/lykon/dreamshaper-8-lcm', inputs);
  
        return new Response(ibagen, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            "content-type": "image/png",
          },
        });
      } catch (error) {
        console.error('Error:', error);
        return new Response('Internal Server Error', { status: 500 });
      }
    }

    return new Response('Endpoint not found.', { status: 404 });
  },
};
