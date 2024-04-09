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

// Update the sendMessage function to handle image display
const sendMessage = async (message: string) => {
  setIsLoading(true);
  try {
    // Add user message to the messages state
    const updatedMessages: Message[] = [...messages, { role: 'user', content: message }]; // Corrected the type here
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
    const botSetting = `cyberpunk setting, 8-bit or 16-bit old school style, neon colors, based on the following description: ${botMessage}`;

    // Send request to get the image
    const ibagensResponse = await fetch(`${apiUrl}/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(botMessage),
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