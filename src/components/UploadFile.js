import React, { useState } from 'react';

function UploadFile() {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleClear = async () => {
    try {
        const response = await fetch('http://localhost:5000/clear');
        console.log(response);
        if (response.ok) {
          alert('Data Cleared successfully!');
        } else {
          alert('Failed to clear Data.');
        }
      } catch (error) {
      }
  }
  const handleFileUpload = async () => {
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    // <form action="http://localhost:5001/upload" method="post" enctype="multipart/form-data">
    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });
      console.log(response);
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
      <h1>Import Exam Data</h1>
      <input type="file" accept=".sql,.dmp" onChange={handleFileChange} />
      <button onClick={handleFileUpload}>Import</button>&nbsp;
      <button onClick={handleClear}>Clear</button>
    </div>
  );
}

export default UploadFile;
