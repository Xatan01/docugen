import { createChatBotMessage } from 'react-chatbot-kit';
import ActionProvider from './actionProvider';
import MessageParser from './messageParser';

const config = {
  botName: 'ChatBot',
  initialMessages: [createChatBotMessage('Hello! How can I help you today?')],
  customComponents: {},
  customStyles: {
    botMessageBox: {
      backgroundColor: '#376B7E',
    },
    chatButton: {
      backgroundColor: '#5ccc9d',
    },
  },
  widgets: [],
  state: {},
  actionProvider: ActionProvider,   
  messageParser: MessageParser,
};

export default config;
