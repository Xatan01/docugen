import React, { useState, useEffect, useRef } from 'react';
import FileUploadWidget from '../Components/fileUploadWidget';
import './chatbotPage.css';

const API_BASE_URL = 'http://localhost:5000';

const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    { text: 'Hello! How can I help you today?', fromBot: true },
    { text: 'Please upload a file to get started.', fromBot: true }
  ]);
  const [userMessage, setUserMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [documentStructure, setDocumentStructure] = useState(null);
  const [userInputs, setUserInputs] = useState({});
  const [originalFileType, setOriginalFileType] = useState(null);
  const originalStructureRef = useRef(null);

  useEffect(() => {
    if (documentStructure && !originalStructureRef.current) {
      originalStructureRef.current = JSON.parse(JSON.stringify(documentStructure));
    }
  }, [documentStructure]);

  useEffect(() => {
    if (documentStructure) {
      const initializeInputs = (obj, path = '') => {
        return Object.entries(obj).reduce((acc, [key, value]) => {
          const fullPath = path ? `${path}.${key}` : key;
          if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
              acc[fullPath] = value.map((item, index) => initializeInputs(item, `${fullPath}.${index}`));
            } else {
              acc[fullPath] = initializeInputs(value, fullPath);
            }
          } else {
            acc[fullPath] = '';
          }
          return acc;
        }, {});
      };

      setUserInputs(initializeInputs(documentStructure));
    }
  }, [documentStructure]);

  const handleFileUpload = (files) => {
    const acceptedFormats = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];

    const newFiles = Array.from(files).filter(file => {
      if (acceptedFormats.includes(file.type)) {
        setMessages(prevMessages => [
          ...prevMessages,
          { text: `Successfully uploaded ${file.name}.`, fromBot: true }
        ]);
        return true;
      } else {
        setMessages(prevMessages => [
          ...prevMessages,
          { text: `Failed to upload ${file.name}: Unsupported format`, fromBot: true }
        ]);
        return false;
      }
    });
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
    if (newFiles.length > 0) {
      setOriginalFileType(newFiles[0].type);
    }
  };

  const handleUserMessageSubmit = async (e) => {
    e.preventDefault();
    setMessages(prevMessages => [
      ...prevMessages,
      { text: userMessage, fromBot: false }
    ]);

    if (!files.length) {
      setMessages(prevMessages => [
        ...prevMessages,
        { text: 'Please upload a file to get started.', fromBot: true }
      ]);
    } else if (userMessage.trim().toLowerCase() === 'done') {
      setMessages(prevMessages => [
        ...prevMessages,
        { text: 'Processing files, please wait.', fromBot: true }
      ]);

      try {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));

        const response = await fetch(`${API_BASE_URL}/analyze`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setDocumentStructure(result);
        setMessages(prevMessages => [
          ...prevMessages,
          { text: 'Analysis complete. Here is the document structure:', fromBot: true },
          { text: JSON.stringify(result, null, 2), fromBot: true },
          { text: 'Please provide content for each section of the document.', fromBot: true }
        ]);
      } catch (error) {
        setMessages(prevMessages => [
          ...prevMessages,
          { text: `Error processing files: ${error.message}`, fromBot: true }
        ]);
      }
    }
    setUserMessage('');
  };

  const handleInputChange = (path, value) => {
    setUserInputs(prevInputs => {
      const newInputs = { ...prevInputs };
      const keys = path.split('.');
      let current = newInputs;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newInputs;
    });
  };

  const handleGenerateDocument = async () => {
    console.log('Generate Document button clicked');
    console.log('Document Structure:', documentStructure);
    console.log('User Inputs:', userInputs);
    
    try {
      const response = await fetch(`${API_BASE_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          structure: documentStructure,
          userInputs: userInputs,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'generated_document.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      setMessages(prevMessages => [
        ...prevMessages,
        { text: 'Document generated successfully! Check your downloads folder.', fromBot: true }
      ]);
    } catch (error) {
      console.error('Error generating document:', error);
      setMessages(prevMessages => [
        ...prevMessages,
        { text: `Error generating document: ${error.message}`, fromBot: true }
      ]);
    }
  };
  

  const camelToTitleCase = (str) => {
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const addItem = (path) => {
    setDocumentStructure((prevStructure) => {
      const newStructure = JSON.parse(JSON.stringify(prevStructure)); 
      const keys = path.split('.');
      let current = newStructure;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      const lastKey = keys[keys.length - 1];
      const firstItem = current[lastKey][0];

      if (firstItem) {
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
        const newItem = Object.keys(originalItem[0]).reduce((acc, key) => {
          acc[key] = Array.isArray(originalItem[0][key]) ? [] : '';
          return acc;
        }, {});
        current[lastKey].push(newItem);
      }

      return newStructure;
    });
  };

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

  const getUserInputValue = (path) => {
    return path.split('.').reduce((obj, key) => (obj && obj[key] !== 'undefined') ? obj[key] : '', userInputs);
  };

  const renderDocumentStructure = (structure, path = '') => {
    return Object.entries(structure).map(([key, value]) => {
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
        const isPlaceholder = value.startsWith('[') && value.endsWith(']');
        const displayValue = getUserInputValue(fullPath);
        const inputValue = isPlaceholder ? displayValue : (displayValue || value);
  
        return (
          <div key={fullPath} className="input-section">
            <label htmlFor={fullPath}>{titleCaseKey}</label>
            <textarea
              id={fullPath}
              value={inputValue}
              onChange={(e) => handleInputChange(fullPath, e.target.value)}
              placeholder={isPlaceholder ? value : ''}
            />
          </div>
        );
      }
    });
  };
  

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
          <form onSubmit={handleUserMessageSubmit} className="message-form">
            <FileUploadWidget handleFileUpload={handleFileUpload} />
            <input
              type="text"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
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