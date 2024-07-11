import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

export const acceptedFormats = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword'
];

export const handleFileUpload = (files, setMessages, setFiles) => {
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
};

export const handleUserMessageSubmit = async (userMessage, setMessages, setUserMessage, files, setDocumentStructure) => {
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

      const response = await axios.post(`${API_BASE_URL}/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setDocumentStructure(response.data);
      setMessages(prevMessages => [
        ...prevMessages,
        { text: 'Analysis complete. Here is the document structure:', fromBot: true },
        { text: JSON.stringify(response.data, null, 2), fromBot: true },
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

export const generateDocument = async (documentStructure, userInputs, originalFileType, setMessages) => {
  console.log('generateDocument function called');
  try {
    console.log('Sending request to backend');
    const response = await axios.post(`${API_BASE_URL}/generate`, {
      structure: documentStructure,
      userInputs,
      originalFileType
    }, {
      responseType: 'arraybuffer'
    });
    console.log('Received response from backend');

    const blob = new Blob([response.data], { type: response.headers['content-type'] });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'generated_document' + (originalFileType.includes('word') ? '.docx' : '.pdf'));
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);

    setMessages(prevMessages => [
      ...prevMessages,
      { text: 'Document generated successfully!', fromBot: true },
      { text: 'The document has been downloaded to your device.', fromBot: true }
    ]);
  } catch (error) {
    console.error('Error generating document:', error);
    setMessages(prevMessages => [
      ...prevMessages,
      { text: `Error generating document: ${error.message}`, fromBot: true }
    ]);
  }
};
