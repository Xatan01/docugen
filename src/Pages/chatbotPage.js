// src/Pages/chatbotPage.js
import React, { useState } from 'react';
import FileUploadWidget from '../Components/fileUploadWidget';
import { handleFileUpload, handleUserMessageSubmit, generateDocument } from '../Chatbot/chatbotLogic';
import './chatbotPage.css';

const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    { text: 'Hello! How can I help you today?', fromBot: true },
    { text: 'Please upload a file to get started.', fromBot: true }
  ]);
  const [userMessage, setUserMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [documentStructure, setDocumentStructure] = useState(null);
  const [userInputs, setUserInputs] = useState({});

  const handleFileChange = (files) => handleFileUpload(files, setMessages, setFiles);

  const handleUserMessageChange = (e) => setUserMessage(e.target.value);

  const handleUserMessageSubmitWrapper = (e) => {
    e.preventDefault();
    handleUserMessageSubmit(userMessage, setMessages, setUserMessage, files, setDocumentStructure);
  };

  const handleInputChange = (path, value) => {
    setUserInputs(prevInputs => {
      const newInputs = { ...prevInputs };
      const keys = path.split('.');
      keys.reduce((acc, key, idx) => {
        if (idx === keys.length - 1) acc[key] = value;
        else acc[key] = acc[key] || {};
        return acc[key];
      }, newInputs);
      return newInputs;
    });
  };

  const handleGenerateDocument = () => generateDocument(documentStructure, userInputs, setMessages);

  const camelToTitleCase = (str) => str.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();

  const renderDocumentStructure = (structure, path = '') => Object.entries(structure).map(([key, value]) => {
    const fullPath = path ? `${path}.${key}` : key;
    const titleCaseKey = camelToTitleCase(key);

    if (Array.isArray(value)) {
      return (
        <div key={fullPath} className="nested-section">
          <h3>{titleCaseKey}</h3>
          {value.map((item, index) => (
            <div key={`${fullPath}.${index}`} className="array-item">
              <h4>Item {index + 1}</h4>
              {renderDocumentStructure(item, `${fullPath}.${index}`)}
            </div>
          ))}
        </div>
      );
    } else if (typeof value === 'object' && value !== null) {
      return (
        <div key={fullPath} className="nested-section">
          <h3>{titleCaseKey}</h3>
          {renderDocumentStructure(value, fullPath)}
        </div>
      );
    } else {
      return (
        <div key={fullPath} className="input-section">
          <label htmlFor={fullPath}>{titleCaseKey}</label>
          <textarea
            id={fullPath}
            value={userInputs[fullPath] || ''}
            onChange={(e) => handleInputChange(fullPath, e.target.value)}
            placeholder={value}
          />
        </div>
      );
    }
  });

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
      {documentStructure && (
        <div className="document-structure">
          <h2>Document Structure</h2>
          {renderDocumentStructure(documentStructure)}
          <button onClick={handleGenerateDocument}>Generate Document</button>
        </div>
      )}
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

export default ChatbotPage;