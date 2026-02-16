'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useKonami } from 'react-konami-code';
import Header from './Header';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const SYSTEM_PROMPT = `Your task is to serve as the dungeon master for a RPG-style text game - based on the "Choose Your Own adventure" books from the '80s - Serve as the guide in a futuristic cyberpunk world filled with advanced technology, neon-lit cityscapes, and intrigue. Envision a sprawling metropolis where towering skyscrapers cast long shadows over crowded streets, and neon signs flicker with messages of hope and despair. Your role is to set the scene, narrate NPC interactions, and present the user with 2 or 3 options to navigate through the story. Progress will only continue after the user selects one of these options. If they deviate, respond with "You are stunned, confused about what you need to do," and reiterate the available actions. The ultimate objective is for the user to achieve their goal within this cyberpunk dystopia. Ensure a minimum of 10 interactions for a fulfilling conclusion, with potential outcomes ranging from triumph to failure, including unexpected twists and dangers lurking in the shadows.`;

export default function SciFiChat() {
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [sceneImageUrl, setSceneImageUrl] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: SYSTEM_PROMPT },
  ]);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);

  const easterEgg = () => {
    const BackgroundAudio = new Audio('konami/police.mp3');
    BackgroundAudio.play();
  };

  useKonami(easterEgg);

  const sendMessage = async (message: string) => {
    setIsLoading(true);
    try {
      const updatedMessages: Message[] = [
        ...messages,
        { role: 'user', content: message },
      ];
      setMessages(updatedMessages);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(
          result.error + (result.details ? ': ' + result.details : '')
        );
      }

      const botMessage = result.response || 'No response received';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: botMessage },
      ]);

      if (botMessage) {
        try {
          const imageResponse = await fetch('/api/image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: `cyberpunk futuristic setting, 8-bit retro pixel art style, neon colors, ${botMessage.substring(0, 200)}`,
            }),
          });

          if (imageResponse.ok) {
            const blob = await imageResponse.blob();
            const imageUrl = URL.createObjectURL(blob);
            setSceneImageUrl(imageUrl);
          }
        } catch (imageError) {
          console.error('Image generation error:', imageError);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
      setMessageInput('');
    }
  };

  const handleSendMessage = () => {
    if (isInitialLoad) {
      const message = `My name is ${userName} and I'm a ${userRole} - Let's begin!`;
      sendMessage(message);
      setIsInitialLoad(false);
    } else {
      const message = messageInputRef.current!.value.trim();
      if (message) {
        sendMessage(message);
      }
    }
  };

  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const message = messageInputRef.current!.value.trim();
      if (message) {
        sendMessage(message);
      }
    }
  };

  return (
    <>
      <Header />
      <main id="nescss">
        <div className="flex">
          <div className="text">
            <section className="message-list" ref={chatHistoryRef}>
              {messages.map((message, index) => (
                <section
                  key={index}
                  className={`message ${message.role === 'user' ? '-left' : '-right'}`}
                >
                  {message.role !== 'system' && (
                    <div
                      className={`nes-balloon ${message.role === 'user' ? 'from-left' : 'from-right'}`}
                    >
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
                      <select
                        id="default_select"
                        value={userRole}
                        onChange={(e) => setUserRole(e.target.value)}
                      >
                        <option value="">What is your class?</option>
                        <option value="Private Detective">
                          Private Detective
                        </option>
                        <option value="Replicant">Replicant</option>
                      </select>
                    </div>
                  </>
                ) : (
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
                )}
                <button
                  className={`nes-btn ${isLoading ? 'is-disabled' : 'is-primary'}`}
                  onClick={handleSendMessage}
                  disabled={isLoading}
                  style={{ marginLeft: '10px' }}
                >
                  {isLoading ? '...' : 'Send'}
                </button>
              </div>
            </section>
          </div>
          <div
            className="ibagen"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {sceneImageUrl && <img src={sceneImageUrl} alt="Scene illustration" />}
          </div>
        </div>
      </main>
    </>
  );
}
