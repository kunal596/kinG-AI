import React, { useState } from 'react';
import './App.css';
import { HashLoader } from 'react-spinners';

// Initialize the API with your key (replace with your own API key)
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI("AIzaSyDNk-Olmm1VbyWtTBHl30RAFJ8fVFDj8Mc");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

function App() {
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Specify the path to your images
  const userImage = '/assets/user-image.png';  // Replace with your custom user image
  const assistantImage = '/assets/assistant-image.png'; // Replace with your custom assistant image

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Check if the message is a request for code (e.g., "prime number code")
  const isCodeRequest = (message) => {
    const keywords = ['prime number', 'code', 'function', 'algorithm', 'solution'];
    return keywords.some(keyword => message.toLowerCase().includes(keyword));
  };

  // Send message to Google Generative AI API
  const handleSendMessage = async () => {
    if (!userMessage.trim()) return; // Don't send empty messages

    // Add user message to chat and clear input field
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'user', text: userMessage },
    ]);
    setUserMessage(''); // Clear the input field

    // Set loading state to true
    setIsLoading(true);

    try {
      // Send the message to the Google Gemini model for generating a response
      const result = await model.generateContent(userMessage);

      // Extract the response text from the result
      let botMessage = result.response.text();

      // Check if it's a code-related query (e.g., prime number code)
      if (isCodeRequest(userMessage)) {
        // Format the response as a code block
        botMessage = `<pre class="code-block">${botMessage}</pre>`;
      } else {
        // For non-code responses, remove unwanted HTML tags and leave the text
        botMessage = botMessage.replace(/<\/?[^>]+(>|$)/g, ""); // Strip any HTML tags
      }

      // Add the formatted response to the chat
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', text: botMessage },
      ]);
    } catch (error) {
      console.error("Error generating response:", error);
      // Add a fallback error message to inform the user
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', text: 'Sorry, there was an error processing your request.' },
      ]);
    } finally {
      // Set loading state to false after the response is received
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      {/* Video background */}
      <div className="video-background">
        <video autoPlay muted loop>
          <source src="/assets/background-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Main content */}
      <div className="content">
        <h1 className="centered-title">KING-AI CHAT</h1>

        <div className="chat-window">
          <div className="chat-box">
            {messages.length === 0 ? (
              <div className="start-conversation">
                Start Conversation
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className={`message ${msg.role}`}>
                  <div className="avatar">
                    {/* Display a placeholder or loading spinner if the image is loading */}
                    <img 
                      src={msg.role === 'user' ? userImage : assistantImage} 
                      alt="Avatar" 
                      onLoad={handleImageLoad}
                      style={{ display: imageLoading ? 'none' : 'block' }} 
                    />
                    {imageLoading && <div className="loading-placeholder">Loading...</div>}
                  </div>
                  <div className="message-text">
                    {msg.role === 'user' ? (
                      <span>{msg.text}</span>
                    ) : (
                      <div
                        dangerouslySetInnerHTML={{ __html: msg.text }}
                      />
                    )}
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="message assistant">
                <HashLoader color="#36d7b7" size={40} />
              </div>
            )}
          </div>

          <div className="chat-input">
            <input
              type="text"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder="Type a message..."
            />
            <button onClick={handleSendMessage} className="send-btn">
              <i className="fas fa-arrow-up"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
