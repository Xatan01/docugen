// src/Chatbot.js
import React, { useState } from 'react';
import FileUploadWidget from '../Components/fileUploadWidget';
import { handleFileUpload, handleUserMessageSubmit } from '../Chatbot/chatbotLogic';
import './chatbotPage.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { text: 'Hello! How can I help you today?', fromBot: true },
    { text: 'Please upload a file to get started', fromBot: true }
  ]);
  const [userMessage, setUserMessage] = useState('');
  const [files, setFiles] = useState([]);

  const handleFileChange = (files) => {
    handleFileUpload(files, setMessages, setFiles);
  };

  const handleUserMessageChange = (e) => {
    setUserMessage(e.target.value);
  };

  const handleUserMessageSubmitWrapper = (e) => {
    e.preventDefault();
    handleUserMessageSubmit(userMessage, setMessages, setUserMessage, files);
  };

  return (
    <div className="chatbot-container">
      <h1>Document Generator</h1>
      <div className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.fromBot ? 'bot' : 'user'}`}>
            <span className="sender">{msg.fromBot ? 'Bot: ' : 'User: '}</span>{msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleUserMessageSubmitWrapper} className="message-form">
        <FileUploadWidget handleFileUpload={handleFileChange} />
        <input
          type="text"
          value={userMessage}
          onChange={handleUserMessageChange}
          placeholder="Type a message..."
          className="message-input"
        />
        <button type="submit" className="message-submit-button">Send</button>
      </form>
    </div>
  );
};

export default Chatbot;
