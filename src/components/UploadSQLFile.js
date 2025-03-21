import React, { useState } from 'react';

function UploadFile() {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('File uploaded and imported successfully!');
      } else {
        alert('Failed to upload file.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while uploading the file.');
    }
  };

  return (
    <div>
      <h1>Upload SQL File</h1>
      <input type="file" accept=".sql" onChange={handleFileChange} />
      <button onClick={handleFileUpload}>Upload and Import</button>
    </div>
  );
}

export default UploadFile;
