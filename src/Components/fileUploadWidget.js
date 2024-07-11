import React from 'react';
import { AiOutlinePaperClip } from 'react-icons/ai';
import './fileUploadWidget.css';

const FileUploadWidget = ({ handleFileUpload }) => {
  const handleFileChange = (e) => {
    const files = e.target.files;
    handleFileUpload(files);
  };

  return (
    <div className="file-upload-widget">
      <label htmlFor="file-upload" className="file-upload-label">
        <AiOutlinePaperClip size={24} />
      </label>
      <input
        id="file-upload"
        type="file"
        multiple
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default FileUploadWidget;