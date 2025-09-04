import React, { useState, useRef, useEffect } from "react";
import Head from "next/head";
import { useKonami } from 'react-konami-code';
import Header from "./components/header"

export interface Env {}
export const runtime = 'experimental-edge';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const Chat: React.FC = () => {
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [messageInput, setMessageInput] = useState('');


  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: `Your task is to serve as the dungeon master for a RPG-style text game - based on the "Choose Your Own adventure" books from the '80s - in a medieval fantasy realm teeming with magic, mythical creatures, and monsters. Imagine a world where ancient forests whisper secrets, towering mountains guard hidden treasures, and sprawling cities bustle with life and intrigue. Begin by describing the scene, setting the stage for the user's adventure. Narrate NPC interactions and present the user with 2 or 3 options to proceed, ensuring progress halts until they select one. If they deviate, respond with "You are stunned, confused about what you need to do," and repeat the available actions. The objective of the story is for the user to retrieve the legendary Golden Axe. Ensure a minimum of 10 interactions for a fulfilling conclusion, with potential outcomes including success, failure, death, or impasse.` }
  ]);
 

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);

  const easterEgg = () => {
    const BackgroundAudio = new Audio("konami/ultima.mp3");
    BackgroundAudio.play();
  };

  useKonami(easterEgg);

  const debugFetch = async (url: string, options: RequestInit) => {
    console.log('Fetching from:', url);
    console.log('With options:', options);
    
    try {
      const response = await fetch(url, options);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  };


const sendMessage = async (message: string) => {
  setIsLoading(true);
  try {
    const updatedMessages: Message[] = [...messages, { role: 'user', content: message }];
    setMessages(updatedMessages);

    const response = await fetch(`/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages: updatedMessages }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let botMessage = '';

    // Add a temporary message that will be updated
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          // Handle completion signal
          if (data === '[DONE]') {
            break;
          }
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              botMessage += parsed.text;
              // Update the last message with the accumulated text
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = botMessage;
                return newMessages;
              });
            } else if (parsed.error) {
              console.error('Stream error:', parsed.error);
              setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: 'Sorry, I encountered an error. Please try again.' 
              }]);
              break;
            }
          } catch (e) {
            console.error('Error parsing chunk:', e);
          }
        }
      }
    }

    // Generate image after full response is received
    if (botMessage) {
      try {
        const imageResponse = await fetch(`/api/image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: `medieval fantasy setting, 8-bit retro pixel art style, ${botMessage.substring(0, 200)}`
          }),
        });

        if (imageResponse.ok) {
          const blob = await imageResponse.blob();
          const imageUrl = URL.createObjectURL(blob);
          
          const ibagenContainer = document.querySelector('.ibagen');
          if (ibagenContainer) {
            ibagenContainer.innerHTML = '';
            const imageElement = document.createElement('img');
            imageElement.src = imageUrl;
            ibagenContainer.appendChild(imageElement);
          }
        }
      } catch (imageError) {
        console.error('Image generation error:', imageError);
      }
    }

  } catch (error) {
    console.error('Error:', error);
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: 'Sorry, I encountered an error. Please try again.' 
    }]);
  } finally {
    setIsLoading(false);
    setMessageInput('');
  }
};
const handleSendMessage = () => {
  if (isInitialLoad) {
    // Construct message from user input
    const message = `My name is ${userName} and I'm a ${userRole} - Let's begin!`;
    // Send the message
    sendMessage(message);
    // Update state to indicate initial load is complete
    setIsInitialLoad(false);
  } else {
    const message = messageInputRef.current!.value.trim();
    if (message) {
      sendMessage(message);
    }
  }
};

  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const message = messageInputRef.current!.value.trim();
      if (message) {
        sendMessage(message);
      }
    }
  };

  return (
<>
      <Head>
        <title>Choose Your Own AIdventure</title>
      </Head>

      <Header/>
      <main id="nescss">
      <div className="flex">
      <div className="text">
          <section className="message-list" ref={chatHistoryRef}>
            {messages.map((message, index) => (
              <section key={index} className={`message ${message.role === 'user' ? '-left' : '-right'}`}>

                {message.role !== 'system' && (
                  <div className={`nes-balloon ${message.role === 'user' ? 'from-left' : 'from-right'}`}>
                    <p>{message.content}</p>
                  </div>
                )}
              </section>
            ))}
            <div className="message-input-container">
              {isInitialLoad ? (
                <>
                  <input
                    type="text"
                    placeholder="What is your name, fellow adventurer?"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="nes-input"
                  />
                  <div className="nes-select">
                    <select id="default_select" value={userRole} onChange={(e) => setUserRole(e.target.value)}>
                      <option value="">What is your class?</option>
                      <option value="Warrior">Warrior</option>
                      <option value="Mage">Mage</option>
                      <option value="Cleric">Cleric</option>
                    </select>
                  </div>
                </>
              ) : (
              <>
                <input
                  ref={messageInputRef}
                  type="text"
                  placeholder="Type your Answer..."
                  onKeyUp={handleKeyUp}
                  disabled={isLoading}
                  className="nes-input"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)} 
                />
              </>
              )}
              <button onClick={handleSendMessage} disabled={isLoading}>
  {isLoading ? "Sending..." : "Send"}
</button>
            </div>
          </section>
          </div>
          <div className="ibagen"></div>
          </div>
      </main>
    </>
  );
};

export default Chat;