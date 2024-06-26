// config.js
import { createChatBotMessage } from 'react-chatbot-kit';
import ActionProvider from './actionProvider';
import MessageParser from './messageParser';
import FileUploadWidget from '../Components/fileUploadWidget'; // Adjust the path

const config = {
  botName: 'ChatBot',
  initialMessages: [
    createChatBotMessage('Hello! How can I help you today?'),
    createChatBotMessage('Please upload a file using the widget below:', {
      widget: 'fileUploadWidget',
    }),
  ],
  customComponents: {},
  customStyles: {
    botMessageBox: {
      backgroundColor: '#376B7E',
    },
    chatButton: {
      backgroundColor: '#5ccc9d',
    },
  },
  widgets: [
    {
      widgetName: 'fileUploadWidget',
      widgetFunc: (props) => <FileUploadWidget {...props} />,
      mapStateToProps: ["messages"],
    },
  ],
  state: {},
  actionProvider: ActionProvider,
  messageParser: MessageParser,
};

export default config;
