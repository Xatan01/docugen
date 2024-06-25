import React from 'react';

const FileUploadComponent = ({ onFilesSelect }) => {
  const handleFileChange = (e) => {
    const files = e.target.files;
    onFilesSelect(files);
  };

  return (
    <div>
      <input type="file" multiple onChange={handleFileChange} />
    </div>
  );
};

export default FileUploadComponent;
