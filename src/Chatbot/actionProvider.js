// actionProvider.js
class ActionProvider {
  constructor(createChatBotMessage, setStateFunc, createClientMessage) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
    this.createClientMessage = createClientMessage;
  }

  greet = () => {
    const greetingMessage = this.createChatBotMessage('Hello! How can I help you today?');
    this.setState((prev) => ({
      ...prev,
      messages: [...prev.messages, greetingMessage],
    }));
  };

  handleFileUpload = (files) => {
    const acceptedFormats = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    Array.from(files).forEach(file => {
      if (acceptedFormats.includes(file.type)) {
        this.sendMessage(`Successfully uploaded ${file.name}`);
      } else {
        this.sendMessage(`Failed to upload ${file.name}: Unsupported format`);
      }
    });
  };

  sendMessage = (message) => {
    const newMessage = this.createChatBotMessage(message);
    this.setState((prevState) => ({
      ...prevState,
      messages: [...prevState.messages, newMessage],
    }));
  };
}

export default ActionProvider;
