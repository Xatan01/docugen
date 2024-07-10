import React, { useState, useEffect, useRef } from 'react';
import FileUploadWidget from '../Components/fileUploadWidget';
import { handleFileUpload, handleUserMessageSubmit, generateDocument } from '../Chatbot/chatbotLogic';
import './chatbotPage.css';

const ChatbotPage = () => {
  // State declarations
  const [messages, setMessages] = useState([
    { text: 'Hello! How can I help you today?', fromBot: true },
    { text: 'Please upload a file to get started.', fromBot: true }
  ]);
  const [userMessage, setUserMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [documentStructure, setDocumentStructure] = useState(null);
  const [userInputs, setUserInputs] = useState({});

  // Ref to store the original structure
  const originalStructureRef = useRef(null);

  // Effect to set the original structure
  useEffect(() => {
    if (documentStructure && !originalStructureRef.current) {
      originalStructureRef.current = JSON.parse(JSON.stringify(documentStructure));
    }
  }, [documentStructure]);

  // Handler for file uploads
  const handleFileChange = (files) => handleFileUpload(files, setMessages, setFiles);

  // Handler for user message input
  const handleUserMessageChange = (e) => setUserMessage(e.target.value);

  // Handler for user message submission
  const handleUserMessageSubmitWrapper = (e) => {
    e.preventDefault();
    handleUserMessageSubmit(userMessage, setMessages, setUserMessage, files, setDocumentStructure);
  };

  // Handler for input changes in the document structure
  const handleInputChange = (path, value) => {
    setUserInputs(prevInputs => {
      const newInputs = { ...prevInputs };
      const keys = path.split('.');
      keys.reduce((acc, key, idx) => {
        if (idx === keys.length - 1) acc[key] = value;
        else acc[key] = acc[key] || {};
        return acc;
      }, newInputs);
      return newInputs;
    });
  };

  // Handler for generating the document
  const handleGenerateDocument = () => generateDocument(documentStructure, userInputs, setMessages);

  // Helper function to convert camelCase to Title Case
  const camelToTitleCase = (str) => str.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();

  // Function to add an item to an array in the document structure
  const addItem = (path) => {
    setDocumentStructure((prevStructure) => {
      const newStructure = JSON.parse(JSON.stringify(prevStructure)); // Deep clone the structure
      const keys = path.split('.');
      let current = newStructure;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      const lastKey = keys[keys.length - 1];
      const firstItem = current[lastKey][0];

      if (firstItem) {
        // Create a new object with the same structure as the first item, but with empty values
        const newItem = Object.keys(firstItem).reduce((acc, key) => {
          acc[key] = Array.isArray(firstItem[key]) ? [] : '';
          return acc;
        }, {});
        current[lastKey].push(newItem);
      } else if (originalStructureRef.current) {
        let originalItem = originalStructureRef.current;
        keys.forEach((key) => {
          originalItem = originalItem[key];
        });
        // Create a new object with the same structure as the original item, but with empty values
        const newItem = Object.keys(originalItem[0]).reduce((acc, key) => {
          acc[key] = Array.isArray(originalItem[0][key]) ? [] : '';
          return acc;
        }, {});
        current[lastKey].push(newItem);
      }

      return newStructure;
    });
  };

  // Function to delete an item from an array in the document structure
  const deleteItem = (path, index) => {
    setDocumentStructure(prevStructure => {
      const newStructure = { ...prevStructure };
      const keys = path.split('.');
      let current = newStructure;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]].splice(index, 1);
      return newStructure;
    });
  };

  // Function to render the document structure recursively
  const renderDocumentStructure = (structure, path = '') => Object.entries(structure).map(([key, value]) => {
    const fullPath = path ? `${path}.${key}` : key;
    const titleCaseKey = camelToTitleCase(key);

    if (Array.isArray(value)) {
      return (
        <div key={fullPath} className="nested-section">
          <h3>{titleCaseKey}</h3>
          {value.map((item, index) => (
            <div key={`${fullPath}.${index}`} className="array-item">
              <div className="array-item-header">
                <h4>Item {index + 1}</h4>
                <button onClick={() => deleteItem(fullPath, index)} className="delete-button">Delete</button>
              </div>
              {renderDocumentStructure(item, `${fullPath}.${index}`)}
            </div>
          ))}
          <button onClick={() => addItem(fullPath)} className="add-button">Add {titleCaseKey}</button>
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

  // Component render
  return (
    <div className="chatbot-container">
      <h1 className="page-title">Document Generator</h1>
      <div className="content-wrapper">
        <div className="chat-section">
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
        {documentStructure && (
          <div className="document-structure">
            <h2>Document Structure</h2>
            <div className="structure-content">
              {renderDocumentStructure(documentStructure)}
            </div>
            <button onClick={handleGenerateDocument} className="generate-button">Generate Document</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatbotPage;