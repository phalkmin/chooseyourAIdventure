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
  const apiUrl = process.env.NEXT_PUBLIC_CF_WORKER;
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [messageInput, setMessageInput] = useState('');


  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: `Your task is to serve as the dungeon master for a RPG-style text game - based on the "Choose Your Own adventure" books from the '80s - Serve as the guide in a futuristic cyberpunk world filled with advanced technology, neon-lit cityscapes, and intrigue. Envision a sprawling metropolis where towering skyscrapers cast long shadows over crowded streets, and neon signs flicker with messages of hope and despair. Your role is to set the scene, narrate NPC interactions, and present the user with 2 or 3 options to navigate through the story. Progress will only continue after the user selects one of these options. If they deviate, respond with "You are stunned, confused about what you need to do," and reiterate the available actions. The ultimate objective is for the user to achieve their goal within this cyberpunk dystopia. Ensure a minimum of 10 interactions for a fulfilling conclusion, with potential outcomes ranging from triumph to failure, including unexpected twists and dangers lurking in the shadows.` }
  ]);
 

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);

  const easterEgg = () => {
    const BackgroundAudio = new Audio("konami/police.mp3");
    BackgroundAudio.play();
  };

  useKonami(easterEgg);

const sendMessage = async (message: string) => {
  const workerUrl = process.env.NEXT_PUBLIC_CF_WORKER;
  
  if (!workerUrl) {
    console.error('NEXT_PUBLIC_CF_WORKER environment variable is not set');
    return;
  }

  setIsLoading(true);
  try {
    const updatedMessages: Message[] = [...messages, { role: 'user', content: message }];
    setMessages(updatedMessages);

    // Prepare the request body with the current chat history
    const requestBody = { messages: updatedMessages };

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
    const botSetting = `cyberpunk setting, 8-bit or 16-bit old school style, neon colors, based on the following description: ${botMessage}`;

    // Generate image after full response is received
    if (botMessage) {
      try {
        const imageResponse = await fetch(`/api/image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: `cyberpunk futuristic setting, 8-bit retro pixel art style, neon colors, ${botMessage.substring(0, 200)}`
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
                      <option value="Private Detective">Private Detective</option>
                      <option value="Replicant">Replicant</option>
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