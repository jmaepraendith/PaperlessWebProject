import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../styles/HomePage.css";

const HomePageWithoutLogin = () => {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [fileID, setFileID] = useState(null);
  const [jsonData, setJsonData] = useState(null);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

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
    formData.append('username', 'NOACCOUNT');

    try {
      // Add upload progress monitoring
      const response = await axios.post('http://localhost:13889/paperless/process', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
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
        
        // Initialize selected columns structure
        // Changed: All columns are now unselected by default for guest users
        const initialSelected = {};
        response.data.forEach(table => {
          initialSelected[table.table] = []; // Start with no columns selected
        });
        
        setSelectedColumns(initialSelected);
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
    // Check if any columns are selected
    const hasSelectedColumns = Object.values(selectedColumns).some(
      columnArray => columnArray && columnArray.length > 0
    );
    
    if (!hasSelectedColumns) {
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
      const response = await axios.get(`http://localhost:13889/paperless/getExcelFileGuest/${file_ID}`, {
        responseType: 'blob'  // Ensures file is downloaded as binary
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Project_${file_ID}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        window.location.reload();
      }, 2000); // refresh page

    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download Excel file.");
    }
  };

  // Toggle mobile menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="container">
      <header>
        <div className="header-left">
          <img src="/headerLogo.png" alt="Paperless Flow Logo" className="logo-activity" />
          {/* Hamburger menu next to logo */}
          <div className="hamburger" onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        
        <nav className={`nav-header ${menuOpen ? 'nav-open' : ''}`}>
          <p>
            <a onClick={() => navigate(`/login`)}>Log in</a>
          </p>
          <p className="AboutUsLink"><a>About us</a></p>
          <p className="AllToolsLink"><a>All Tools</a></p>
          <p className="UserLink"><a>Welcome, Guest!</a></p>
        </nav>
      </header>

      <div className="homepage-container">
        <h1 className='home-h1'>Documents To Excel</h1>
        <h2 className='home-h2'>Convert purchase orders, quotations, and receipts into Excel files quickly and easily</h2>
        
        <div className="upload-container">
          <input type="file" multiple onChange={handleFileChange} />
          <button className='upload' onClick={handleUpload} disabled={processing}>
            {processing ? "Processing..." : "Upload File"}
          </button>
        </div>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div style={{ marginTop: '1rem', width: '80%', maxWidth: '500px', margin: '20px auto' }}>
            <progress value={uploadProgress} max="100" style={{ width: '100%' }} />
            <div>{uploadProgress}%</div>
          </div>
        )}

        {fileID && !isConfirmed && (
          <div className="file-options">
            <p className='file-id'>Processed File ID: {fileID}</p>
            <h3>Select columns to include in your Excel</h3>
            <p>Click on columns to select them (green = selected, white = not selected)</p> 
            
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
          <div className="download-section">
            <p>Your selection has been confirmed!</p>
            <h3>You can download only once. Make sure to save it.</h3>
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

export default HomePageWithoutLogin;