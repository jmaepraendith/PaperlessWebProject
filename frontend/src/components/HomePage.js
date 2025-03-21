import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import "../styles/HomePage.css";
import axios from 'axios';

const HomePage = () => {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [fileID, setFileID] = useState(null);
  const [jsonData, setJsonData] = useState(null);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const navigate = useNavigate();
  const { username } = useParams();

  // Handle file selection
  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
    setUploadProgress(0);
  };

  // Handle file upload
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
    formData.append('username', username);

    try {
      const response = await axios.post('http://localhost:13889/paperless/process', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setFileID(response.data.file_ID);
      setJsonData(response.data);

      alert("Files processed successfully!");  

      // Fetch available columns based on file ID
      fetchColumns(response.data.file_ID);

    } catch (error) {
      console.error("Error processing files:", error);
      alert("Failed to process files.");
    } finally {
      setProcessing(false);
    }
  };

  // Fetch available columns from the backend
  const fetchColumns = async (file_ID) => {
    try {
      const response = await axios.get(`http://localhost:13889/paperless/get-column-each-table/${file_ID}`);
      console.log("Columns received:", response.data);

      if (response.data.length > 0) {
        setAvailableColumns(response.data); // Store the entire table & column structure
        let allColumns = response.data.flatMap(table => table.columns);
        setSelectedColumns(allColumns); // Select all columns by default
      }
    } catch (error) {
      console.error("Error fetching columns:", error);
      alert("Failed to retrieve table columns.");
    }
  };

  // Handle column selection toggle
  const toggleColumnSelection = (tableName, column) => {
    setSelectedColumns(prev => {
      const updatedTableColumns = prev[tableName] || [];
  
      return {
        ...prev,
        [tableName]: updatedTableColumns.includes(column)
          ? updatedTableColumns.filter(col => col !== column)
          : [...updatedTableColumns, column]
      };
    });
  };
  
  const handleConfirmSelection = async (fileID) => {
    if (selectedColumns.length === 0) {
        alert("Please select at least one column!");
        return;
    }
    setIsConfirmed(true);

    const selectedData = availableColumns
        .map((table) => ({
            table: table.table,
            selectedColumns: selectedColumns[table.table] || [] // Fetch selected columns per table
        }))
        .filter(table => table.selectedColumns.length > 0);

    console.log("Sending structured data:", selectedData);

    try {
        const response = await axios.post(
            `http://localhost:13889/paperless/exportToExcelFile/${fileID}`, 
            { selectedData } // Wrapped in an object
        );

        if (response.status === 200) {
            alert("Excel file created successfully!");
        }
    } catch (error) {
        console.error("Error confirming selection:", error.response ? error.response.data : error.message);
        alert("Failed to create Excel file.");
    }
};

  

const handleDownload = async (file_ID) => {
  try {
      const response = await axios.get(`http://localhost:13889/paperless/getExcelFile/${file_ID}`, {
          responseType: 'blob'  // Ensures file is downloaded as binary
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Project_${file_ID}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download Excel file.");
  }
};


  return (
    <div className="container">
      <header>
        <img src="/headerLogo.png" alt="Paperless Flow Logo" className="logo-activity" />
        <nav className="nav-header">
          <p>
            <button className="Activity-Project" onClick={() => navigate(`/activity/${username}`)}>
              <a>Your Projects</a>
            </button>
          </p>
          <p className="AboutUsLink"><a>About us</a></p>
          <p className="UserLink"><a>Welcome, {username}!</a></p>
        </nav>
      </header>

      <div className="homepage-container">
        <h1 className='home-h1'>Documents To Excel</h1>
        <h2 className='home-h2'>Convert purchase orders, quotations, and receipts into Excel files quickly and easily</h2>
        <input type="file" multiple onChange={handleFileChange} />
        <button className='upload' onClick={handleUpload} disabled={processing}>
          {processing ? "Processing..." : "Upload File"}
        </button>

        {uploadProgress > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <progress value={uploadProgress} max="100" style={{ width: '100%' }} />
            <div>{uploadProgress}%</div>
          </div>
        )}

        {fileID && !isConfirmed && (
          <div>
            <p className='file-id'>Processed File ID: {fileID}</p>
            <h3>File Type: {jsonData?.file_type}</h3>
            <h3>Select columns to include in your Excel:</h3>
            <p>This file with selected columns will be download only once here.</p> 
            <p>If you download this file again in "your project" you will get all column.</p>
            
            <div className="column-selection-grid">
              {availableColumns.length > 0 ? (
                availableColumns.map((table) => (
                  <div key={table.table} className="table-section">
                    <h3>{table.table}</h3>
                    <div className="column-buttons">
                      {table.columns.map((column) => (
                        <button
                          key={column}
                          className={`column-button ${selectedColumns[table.table]?.includes(column) ? 'column-button-selected' : ''}`}
                          onClick={() => toggleColumnSelection(table.table, column)}
                        >
                          {column}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p>Loading columns...</p>
              )}
            </div>

            
            <button
              className="btn-confirm"
              onClick={() => handleConfirmSelection(fileID)}
            >
              Confirm Selection
            </button>
          </div>
        )}

        {isConfirmed && (
          <div>
            <p>Your selection has been confirmed!</p>
            <button
              className="btn-download"
              onClick={() => handleDownload(fileID)}
            >
              Download Excel File
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
