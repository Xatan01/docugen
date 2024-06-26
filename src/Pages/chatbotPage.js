// src/Chatbot.js
import React, { useState } from 'react';
import FileUploadWidget from '../Components/fileUploadWidget';
import './chatbotPage.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { text: 'Hello! How can I help you today?', fromBot: true },
    { text: 'Please upload a file using the widget below:', fromBot: true }
  ]);
  const [userMessage, setUserMessage] = useState('');

  const handleFileUpload = (files) => {
    const acceptedFormats = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    Array.from(files).forEach(file => {
      if (acceptedFormats.includes(file.type)) {
        setMessages(prevMessages => [
          ...prevMessages,
          { text: `Successfully uploaded ${file.name}`, fromBot: true }
        ]);
      } else {
        setMessages(prevMessages => [
          ...prevMessages,
          { text: `Failed to upload ${file.name}: Unsupported format`, fromBot: true }
        ]);
      }
    });
  };

  const handleUserMessageChange = (e) => {
    setUserMessage(e.target.value);
  };

  const handleUserMessageSubmit = (e) => {
    e.preventDefault();
    if (userMessage.trim()) {
      setMessages(prevMessages => [
        ...prevMessages,
        { text: userMessage, fromBot: false }
      ]);
      setUserMessage('');
    }
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
      <FileUploadWidget handleFileUpload={handleFileUpload} />
      <form onSubmit={handleUserMessageSubmit} className="message-form">
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
