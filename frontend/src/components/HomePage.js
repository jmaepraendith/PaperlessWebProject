import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import "../styles/HomePage.css";
import ScrollingBanner from '../styles/ScrollingBanner';

const HomePage = () => {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [fileID, setFileID] = useState(null);
  const [jsonData, setJsonData] = useState(null);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { username } = useParams();

  // Handle file selection
  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
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
    formData.append('username', username);

    try {

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

  
  // Fetch columns from the backend
  const fetchColumns = async (file_ID) => {
    try {
      const response = await axios.get(`http://localhost:13889/paperless/get-column-each-table/${file_ID}`);
      console.log("Columns received:", response.data);

      if (response.data.length > 0) {
        setAvailableColumns(response.data); 
        
        const initialSelected = {};
        response.data.forEach(table => {
          initialSelected[table.table] = []; 
        });
        
        setSelectedColumns(initialSelected);
      }
    } catch (error) {
      console.error("Error fetching columns:", error);
      alert("Failed to retrieve table columns.");
    }
  };

  // for column selection 
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
        selectedColumns: selectedColumns[table.table] || [] 
      }))
      .filter(table => table.selectedColumns.length > 0);

    console.log("Sending structured data:", selectedData);

    try {
      const response = await axios.post(
        `http://localhost:13889/paperless/exportToExcelFile/${fileID}`, 
        { selectedData } 
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

      setTimeout(() => {
        window.location.reload();
      }, 2000); 

    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download Excel file.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/homepage");
  };

  const handleChangePassword = () => {
    navigate("/changepassword");
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleUserDropdown = (e) => {
    e.stopPropagation(); 
    setUserDropdownOpen(!userDropdownOpen);
  };

  useEffect(() => {
    const closeDropdown = (e) => {
      if (userDropdownOpen && !e.target.closest('.user-menu-container')) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('click', closeDropdown);
    return () => document.removeEventListener('click', closeDropdown);
  }, [userDropdownOpen]);

  return (
    <div className="bg">
      <header>
        <div className="header-left">
          <img src="/headerLogo.png" alt="Paperless Flow Logo" className="logo-activity" />
        
          <div className="hamburger" onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        
        <nav className={`nav-header ${menuOpen ? 'nav-open' : ''}`}>
          <p>
            <button className="Activity-Project" onClick={() => navigate(`/activity/${username}`)}>
              <a>Your Projects</a>
            </button>
          </p>
          
         <div className="user-dropdown-container">
            <p className="UserLink" onClick={toggleUserDropdown}>
              <a>Welcome, {username}! <span className="dropdown-arrow">▼</span></a>
            </p>
            {userDropdownOpen && (
              <div className="user-dropdown-menu">
                <button className="dropdown-item" onClick={handleChangePassword}>
                  Change Password
                </button>
                <button className="dropdown-item logout" onClick={handleLogout}>
                  Log out
                </button>
              </div>
            )}
          </div>
        </nav>
      </header>

      <div className="scrolling-banner-container">
        <ScrollingBanner />
      </div>

      <div className="homepage-container">
        <h1 className='home-h1'>Documents To Excel</h1>
        <h2 className='home-h2'>Convert purchase orders, invoices, receipts and bills into Excel files quickly and easily</h2>
        
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
            <h3>You can download this file again in your projects.</h3>
            <h3>Be sure to click download here first.</h3>
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