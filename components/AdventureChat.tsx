'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import Header from './Header';
import Typewriter from './Typewriter';
import { ScenarioConfig } from '../lib/scenarios';
import { useTheme } from '../lib/useTheme';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  portraitUrl?: string;
  npcName?: string;
}

interface AdventureChatProps {
  scenario: ScenarioConfig;
}

let _msgCounter = 0;
function nextMsgId() {
  return `msg-${++_msgCounter}`;
}

export default function AdventureChat({ scenario }: AdventureChatProps) {
  const { theme, toggleTheme } = useTheme();
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const prevSceneUrlRef = useRef<string | null>(null);
  const npcPortraitsRef = useRef<{ [key: string]: string }>({});

  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [sceneImageUrl, setSceneImageUrl] = useState<string | null>(null);
  const [npcPortraits, setNpcPortraits] = useState<{ [key: string]: string }>({});
  const [currentChoices, setCurrentChoices] = useState<string[]>([]);
  const [isTypewritingComplete, setIsTypewritingComplete] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMusicExplicitlyPaused, setIsMusicExplicitlyPaused] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [feedbackClass, setFeedbackClass] = useState<string>('');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Pause audio and revoke all blob URLs on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (prevSceneUrlRef.current) URL.revokeObjectURL(prevSceneUrlRef.current);
      Object.values(npcPortraitsRef.current).forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const sessionSeed = useMemo(() => Math.floor(Math.random() * 1000000), []);

  const [messages, setMessages] = useState<Message[]>([
    { id: nextMsgId(), role: 'system', content: scenario.systemPrompt },
  ]);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages, isTypewritingComplete]);

  // Revoke the previous scene blob URL before storing a new one
  const updateSceneImageUrl = useCallback((newUrl: string) => {
    if (prevSceneUrlRef.current) URL.revokeObjectURL(prevSceneUrlRef.current);
    prevSceneUrlRef.current = newUrl;
    setSceneImageUrl(newUrl);
  }, []);

  const toggleMusic = useCallback(() => {
    if (!audioRef.current) return;
    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicExplicitlyPaused(true);
    } else {
      audioRef.current.play().catch(e => console.error('Audio play failed:', e));
      setIsMusicExplicitlyPaused(false);
    }
    setIsMusicPlaying(prev => !prev);
  }, [isMusicPlaying]);

  const sendMessage = async (message: string) => {
    setIsLoading(true);
    setIsTypewritingComplete(false);

    // Auto-play music on first action if not already playing AND not explicitly paused
    if (!isMusicPlaying && !isMusicExplicitlyPaused && audioRef.current) {
      audioRef.current.play().then(() => setIsMusicPlaying(true)).catch(() => {});
    }

    try {
      const updatedMessages: Message[] = [
        ...messages,
        { id: nextMsgId(), role: 'user', content: message },
      ];
      setMessages(updatedMessages);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      if (result.error) throw new Error(result.error);

      const botMessage = result.response || 'No response received';
      let npcName = '';
      let portraitUrl = '';

      // Trigger action feedback based on keywords
      const lowerMsg = botMessage.toLowerCase();
      if (
        lowerMsg.includes('damage') ||
        lowerMsg.includes('hurt') ||
        lowerMsg.includes('hit') ||
        lowerMsg.includes('attack') ||
        lowerMsg.includes('wound') ||
        lowerMsg.includes('struck') ||
        lowerMsg.includes('pain')
      ) {
        setFeedbackClass('screen-shake flash-red');
        setTimeout(() => setFeedbackClass(''), 1000);
      } else if (
        lowerMsg.includes('gold') ||
        lowerMsg.includes('loot') ||
        lowerMsg.includes('treasure') ||
        lowerMsg.includes('coin') ||
        lowerMsg.includes('found') ||
        lowerMsg.includes('gain') ||
        lowerMsg.includes('reward')
      ) {
        setFeedbackClass('flash-gold');
        setTimeout(() => setFeedbackClass(''), 1000);
      }

      // 1. Parallel Start: Scene Image Generation (Pre-fetching)
      const cleanPrompt = botMessage
        .replace(/NPC:\s*[^\n]+/gi, '')
        .replace(/NARRATIVE:\s*/gi, '')
        .split(/Choices:/i)[0]
        .trim();

      const sceneImagePromise = fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${scenario.imagePromptPrefix}${cleanPrompt.substring(0, 300)}`,
          seed: sessionSeed,
        }),
      }).then(async res => {
        if (res.ok) {
          const blob = await res.blob();
          updateSceneImageUrl(URL.createObjectURL(blob));
        }
      }).catch(err => console.error('Scene image error:', err));

      // 2. NPC Portrait Logic
      const npcMatch = botMessage.match(/NPC:\s*([^\n.:]+)/i);
      if (npcMatch) {
        npcName = npcMatch[1].trim();
        if (npcPortraits[npcName]) {
          portraitUrl = npcPortraits[npcName];
        } else {
          try {
            const portraitResponse = await fetch('/api/image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                prompt: `${scenario.portraitPromptPrefix}${npcName}`,
                seed: Math.floor(Math.random() * 1000000),
              }),
            });
            if (portraitResponse.ok) {
              const blob = await portraitResponse.blob();
              portraitUrl = URL.createObjectURL(blob);
              npcPortraitsRef.current = { ...npcPortraitsRef.current, [npcName]: portraitUrl };
              setNpcPortraits(prev => ({ ...prev, [npcName]: portraitUrl }));
            }
          } catch (err) {
            console.error('Portrait generation error:', err);
          }
        }
      }

      const choiceMatches = botMessage.match(/\[\[(.*?)\]\]/g);
      if (choiceMatches) {
        setCurrentChoices(choiceMatches.map(m => m.replace(/\[\[|\]\]/g, '')));
      } else {
        setCurrentChoices([]);
      }

      setMessages(prev => [
        ...prev,
        { id: nextMsgId(), role: 'assistant', content: botMessage, npcName, portraitUrl },
      ]);

      // Wait for scene image if needed (though it's parallel now)
      await sceneImagePromise;
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev,
        { id: nextMsgId(), role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
      setMessageInput('');
    }
  };

  const handleSendMessage = () => {
    if (isInitialLoad) {
      if (!userName || !userRole) return;
      sendMessage(`My name is ${userName} and I'm a ${userRole} - Let's begin!`);
      setIsInitialLoad(false);
    } else {
      const message = messageInputRef.current?.value.trim() || messageInput.trim();
      if (message) sendMessage(message);
    }
  };

  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') handleSendMessage();
  };

  const playerPortrait = scenario.playerClasses.find(c => c.name === userRole)?.portrait;

  if (!isMounted) return null;

  return (
    <>
      <Header />
      <main id="nescss" className="game-main" data-theme={theme}>
        <audio ref={audioRef} src={scenario.audioTrack} loop />

        <div className={`game-wrapper ${feedbackClass}`}>
          <div className="controls-container">
            <button className="nes-btn is-small" onClick={toggleTheme}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button className="nes-btn is-small" onClick={toggleMusic}>
              {isMusicPlaying ? '🔇' : '🔊'}
            </button>
          </div>

          {/* 1. Scene Viewport */}
          <div className="scene-viewport">
            {sceneImageUrl ? (
              <img src={sceneImageUrl} className="scene-img" alt="Scene" />
            ) : (
              <span className="nes-text is-disabled">Visualizing {scenario.title}...</span>
            )}
          </div>

          {/* 2. Dialogue Log */}
          <div className="dialogue-log" ref={chatHistoryRef}>
            {messages.map((message, index) => {
              if (message.role === 'system') return null;

              const isNarrative = message.role === 'assistant' && !message.portraitUrl;
              // Clean the content of ALL structure tags for the UI
              const cleanContent = message.content
                .replace(/NPC:\s*[^\n]+\n?/i, '')
                .replace(/NARRATIVE:\s*/gi, '')
                .split('Choices:')[0]
                .trim();
              const isLastMessage = index === messages.length - 1;

              if (isNarrative) {
                return (
                  <div key={message.id} className="narrative-row">
                    <div className="nes-container is-rounded narrative-balloon">
                      {isLastMessage ? (
                        <Typewriter
                          text={cleanContent}
                          speed={15}
                          onComplete={() => setIsTypewritingComplete(true)}
                        />
                      ) : (
                        <p>{cleanContent}</p>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <div key={message.id} className={`message-row ${message.role === 'user' ? 'player' : 'npc'}`}>
                  {message.role === 'assistant' && (
                    <div className="avatar-box">
                      <img
                        src={message.portraitUrl || 'https://placehold.co/64/000/fff/png?text=?'}
                        className="avatar-img"
                        alt="NPC"
                      />
                      <span className="avatar-name">{message.npcName || '???'}</span>
                    </div>
                  )}

                  <div className={`nes-balloon ${message.role === 'user' ? 'from-right' : 'from-left'}`}>
                    {message.role === 'assistant' && isLastMessage ? (
                      <Typewriter
                        text={cleanContent}
                        speed={15}
                        onComplete={() => setIsTypewritingComplete(true)}
                      />
                    ) : (
                      <p>{cleanContent}</p>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <div className="avatar-box">
                      <img
                        src={playerPortrait || 'https://placehold.co/64x64/000/fff/png?text=Hero'}
                        className="avatar-img"
                        alt="Player"
                      />
                      <span className="avatar-name">{userName || 'Hero'} ({userRole})</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 3. Command Center */}
          <div className="command-center">
            {isInitialLoad ? (
              <div className="options-grid">
                <h3 className="char-label">Character Creation</h3>
                <input
                  type="text"
                  placeholder="Your Name..."
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="nes-input is-small"
                />
                <div className="nes-select is-small">
                  <select value={userRole} onChange={(e) => setUserRole(e.target.value)}>
                    <option value="">Choose Class...</option>
                    {scenario.playerClasses.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  className="nes-btn is-primary"
                  onClick={handleSendMessage}
                  disabled={isLoading || !userName || !userRole}
                >
                  Begin Adventure
                </button>
              </div>
            ) : (
              <div className="options-area">
                {!isLoading && isTypewritingComplete ? (
                  currentChoices.length > 0 ? (
                    <div className="options-grid">
                      <h3 className="choices-label">What will you do?</h3>
                      {currentChoices.map((choice, idx) => (
                        <button
                          key={idx}
                          className="nes-btn is-primary is-small choice-btn"
                          onClick={() => sendMessage(choice)}
                        >
                          {idx + 1}. {choice}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="input-row">
                      <input
                        ref={messageInputRef}
                        type="text"
                        placeholder={scenario.inputPlaceholder}
                        onKeyUp={handleKeyUp}
                        className="nes-input is-small"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                      />
                      <button className="nes-btn is-primary is-small" onClick={handleSendMessage}>Act</button>
                    </div>
                  )
                ) : (
                  <div className="loading-container">
                    {isLoading ? (
                      <>
                        <p className="nes-text is-disabled loading-text">{scenario.loadingMessage}</p>
                        <progress className="nes-progress is-primary loading-bar" value="50" max="100"></progress>
                      </>
                    ) : (
                      <p className="nes-text is-disabled loading-text">Writing story...</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
