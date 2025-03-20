import React, { useState } from 'react';
import axios from 'axios';

const HomePage = () => {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [fileID, setFileID] = useState(null);
  const [jsonData, setJsonData] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
    // Reset progress when new files are selected
    setUploadProgress(0);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert("Please select at least one file!");
      return;
    }
    setProcessing(true);
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    
    // Retrieve the username from localStorage instead of hardcoding it
    const loggedInUsername = localStorage.getItem('username');
    if (!loggedInUsername) {
      alert("No logged-in user found. Please log in again.");
      setProcessing(false);
      return;
    }
    formData.append('username', loggedInUsername);

    try {
      
      const response = await axios.post('http://localhost:13889/paperless/process', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFileID(response.data.file_ID);
      setJsonData(response.data);
      alert("Files processed successfully!");
    } catch (error) {
      console.error("Error processing files:", error);
      alert("Failed to process files.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container">
      <h1>Documents To Excel</h1>
      <input type="file" multiple onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={processing}>
        {processing ? "Processing..." : "Upload and Process"}
      </button>
      {uploadProgress > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <progress value={uploadProgress} max="100" style={{ width: '100%' }} />
          <div>{uploadProgress}%</div>
        </div>
      )}
      {fileID && (
        <div>
          <p>Processed File ID: {fileID}</p>
          {/* Additional UI to select columns and trigger Excel download can be added here */}
        </div>
      )}
      {jsonData && (
        <div>
          <h2>Extracted JSON Data</h2>
          <pre>{JSON.stringify(jsonData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default HomePage;
