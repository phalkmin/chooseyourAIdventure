import React, { useState, useRef, useEffect } from "react";
import Head from "next/head";
import { useKonami } from 'react-konami-code';
import Header from "./components/header"

export interface Env {}

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

// Update the sendMessage function to handle image display
const sendMessage = async (message: string) => {
  setIsLoading(true);
  try {
    // Add user message to the messages state
    const updatedMessages = [...messages, { role: 'user', content: message }];
    setMessages(updatedMessages);

    // Prepare the request body with the current chat history
    const requestBody = { messages: updatedMessages };

    // Send request to the chat worker
    const response = await fetch(`${apiUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }

    const responseData = await response.json();
    const botMessage = responseData.response.trim();
    const botSetting = `medieval setting, 8-bit or 16-bit old school style, living colors, based on the following description: ${botMessage}`;
    // Send request to get the image
    const ibagensResponse = await fetch(`${apiUrl}/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(botSetting),
    });

    // Check if the request for the image was successful
    if (ibagensResponse.ok) {
      // Convert the response to a blob
      const blob = await ibagensResponse.blob();

      // Create a URL for the blob
      const imageUrl = URL.createObjectURL(blob);

      // Remove existing image elements
      const existingImages = document.querySelectorAll('.ibagen img');
      existingImages.forEach(img => img.remove());

      // Create an image element
      const imageElement = document.createElement('img');

      // Set the source of the image to the URL
      imageElement.src = imageUrl;

      // Append the image element to the .ibagen div
      const ibagenContainer = document.querySelector('.ibagen');
      ibagenContainer?.appendChild(imageElement);
    } else {
      console.error('Error:', ibagensResponse.statusText);
    }

    // Update messages state with the bot response
    setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: botMessage }]);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    setIsLoading(false);
    if (!isInitialLoad && messageInputRef.current) {
      messageInputRef.current.value = ''; // Clear input field only after initial load
    }
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