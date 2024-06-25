import React, { useRef } from 'react';
import Chatbot from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';
import config from '../Chatbot/config';
import ActionProvider from '../Chatbot/actionProvider';
import MessageParser from '../Chatbot/messageParser';
import FileUploadComponent from '../Components/fileUploadComponent'; // Adjust the path as per your project structure
import './chatbotPage.css'; // Import the CSS file

function ChatbotPage() {
  const chatbotRef = useRef(null);

  const handleFilesSelect = (files) => {
    ActionProvider.handleFileUpload(files);  // Assuming ActionProvider instance has handleFileUpload method
  };

  return (
    <div className="chatbot-page">
      <div className="chatbot-container">
        <h1>Document Generator</h1>
        <Chatbot
          ref={chatbotRef}
          config={config}
          actionProvider={ActionProvider}
          messageParser={MessageParser}
        />
        <FileUploadComponent onFilesSelect={handleFilesSelect} />
      </div>
    </div>
  );
}

export default ChatbotPage;
