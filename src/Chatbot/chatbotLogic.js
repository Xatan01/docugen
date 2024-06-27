import axios from 'axios';

export const acceptedFormats = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword'
];

export const handleFileUpload = (files, setMessages, setFiles) => {
  const newFiles = [];
  Array.from(files).forEach(file => {
    if (acceptedFormats.includes(file.type)) {
      setMessages(prevMessages => [
        ...prevMessages,
        { text: `Successfully uploaded ${file.name}, please enter 'done' when all files are uploaded`, fromBot: true }
      ]);
      newFiles.push(file);
    } else {
      setMessages(prevMessages => [
        ...prevMessages,
        { text: `Failed to upload ${file.name}: Unsupported format`, fromBot: true }
      ]);
    }
  });
  setFiles(prevFiles => [...prevFiles, ...newFiles]);
};

export const handleUserMessageSubmit = async (userMessage, setMessages, setUserMessage, files) => {
  setMessages(prevMessages => [
    ...prevMessages,
    { text: userMessage, fromBot: false }
  ]);

  if (files.length === 0) {
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
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await axios.post('/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessages(prevMessages => [
        ...prevMessages,
        { text: `Analysis results: ${JSON.stringify(response.data)}`, fromBot: true }
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
