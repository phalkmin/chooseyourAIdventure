// Next.js API route for local development
// This mimics the Cloudflare function at functions/api/chat.js

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate Content-Type
  if (req.headers['content-type'] !== 'application/json') {
    return res.status(400).json({ error: 'Content-Type must be application/json' });
  }

  // Validate required fields
  if (!req.body.messages || !Array.isArray(req.body.messages)) {
    return res.status(400).json({ error: 'messages field is required and must be an array' });
  }

  // Validate message format
  for (const message of req.body.messages) {
    if (!message.role || !message.content) {
      return res.status(400).json({ error: 'Each message must have role and content fields' });
    }
    if (!['user', 'assistant', 'system'].includes(message.role)) {
      return res.status(400).json({ error: 'Message role must be user, assistant, or system' });
    }
  }

  const chatHistory = req.body.messages;

  // Set up Server-Sent Events response
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });

  try {
    // For local development, we'll simulate the AI response
    // In production, this would use the Cloudflare AI binding
    const lastUserMessage = chatHistory.filter(msg => msg.role === 'user').pop();
    const simulatedResponse = await simulateAIResponse(lastUserMessage.content);

    // Send response as chunks to simulate streaming
    const chunks = simulatedResponse.match(/.{1,10}/g) || [simulatedResponse];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const data = `data: ${JSON.stringify({ text: chunk })}\n\n`;
      res.write(data);
      
      // Add a small delay to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Send completion signal
    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('Chat API error:', error);
    const errorData = `data: ${JSON.stringify({ error: 'Processing failed' })}\n\n`;
    res.write(errorData);
    res.end();
  }
}

// Simulate AI response for local development
async function simulateAIResponse(userMessage) {
  // Simple rule-based responses for testing
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