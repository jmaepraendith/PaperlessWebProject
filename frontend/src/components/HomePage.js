import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import "../styles/HomePage.css";
import axios from 'axios';

const HomePage = () => {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [fileID, setFileID] = useState(null);
  const [jsonData, setJsonData] = useState(null);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const navigate = useNavigate();
  const { username } = useParams();

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
      });
      setFileID(response.data.file_ID);
      setJsonData(response.data);
      alert("Files processed successfully!");

      // Set columns based on file type
      let columns = [];
      if (response.data.file_type === "Purchase order") {
        columns = [
          'file_ID', 'file_type', 'fileimagename', 'purchase_order_number', 'order_date',
          'customer_name', 'product_item', 'description', 'quantity', 'unit_price',
          'total_product_price', 'all_product_total_price', 'supplier_name', 'order_status', 'delivery_date'
        ];
      } else if (response.data.file_type === "Bill") {
        columns = [
          'file_ID', 'file_type', 'fileimagename', 'receipt_number', 'receipt_date', 
          'payment_description', 'payer_name', 'payment_method', 'product_item', 
          'description', 'quantity', 'unit_price', 'total_product_price', 
          'all_product_total_price', 'amount_paid'
        ];
      } else if (response.data.file_type === "Invoice") {
        columns = [
          'file_ID', 'file_type', 'fileimagename', 'invoice_number', 'invoice_date',
          'seller_name', 'buyer_name', 'product_item', 'description', 'quantity',
          'unit_price', 'total_product_price', 'all_total_before_tax', 'vat',
          'all_total_amount_including_VAT', 'payment_terms', 'payment_method'
        ];
      }
      else {
        columns = [
          'file_ID', 'file_type', 'fileimagename', 'purchase_order_number', 'order_date',
          'customer_name', 'product_item', 'description', 'quantity', 'unit_price',
          'total_product_price', 'all_product_total_price', 'supplier_name', 'order_status', 'delivery_date'
        ];
      }
      setAvailableColumns(columns);
      setSelectedColumns(columns); // Initially select all columns
    } catch (error) {
      console.error("Error processing files:", error);
      alert("Failed to process files.");
    } finally {
      setProcessing(false);
    }
  };

  const toggleColumnSelection = (column) => {
    // Just toggle the visual selection state, but keep all columns selected for processing
    setSelectedColumns(prev => {
      if (prev.includes(column)) {
        return prev.filter(col => col !== column);
      } else {
        return [...prev, column];
      }
    });
  };

  const handleConfirmSelection = () => {
    if (selectedColumns.length === 0) {
      alert("Please select at least one column!");
      return;
    }
    setIsConfirmed(true);
    alert("Selection confirmed. Now you can process the data.");
  };

  const handleDownload = async (file_ID) => {
    try {
      const response = await axios.get(`http://localhost:13889/paperless/getExcelFile/${file_ID}`, {
        responseType: 'blob'
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
            <h3>Select columns to include in Excel:</h3>
            
            <div className="column-selection-grid">
              {availableColumns.map((column) => (
                <button
                  key={column}
                  className={`column-button ${selectedColumns.includes(column) ? 'column-button-selected' : ''}`}
                  onClick={() => toggleColumnSelection(column)}
                >
                  {column}
                </button>
              ))}
            </div>
            
            <button
              className="btn-confirm"
              onClick={handleConfirmSelection}
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