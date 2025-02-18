// import React, { useState } from 'react';
// import axios from 'axios';

// const HomePage = () => {
//   const [files, setFiles] = useState([]);
//   const [selectedColumns, setSelectedColumns] = useState({
//     bills: [],
//     invoice: [],
//     purchaseOrder: [],
//   });
//   const [fileId, setFileId] = useState(null);
//   const [jsonData, setJsonData] = useState(null);

//   const handleFileChange = (e) => {
//     setFiles([...e.target.files]);
//   };

//   const handleUpload = async () => {
//     if (files.length === 0) {
//       alert("Please select at least one file!");
//       return;
//     }

//     try {
//       const uploadedData = [];
//       const generatedFileId = `file_${Date.now()}`;
//       setFileId(generatedFileId);

//       for (const file of files) {
//         const formData = new FormData();
//         formData.append('file', file);

//         const pythonResponse = await axios.post('http://localhost:5000/process', formData, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });

//         console.log('Python Service Response:', pythonResponse.data);
//         uploadedData.push(pythonResponse.data);
//       }

//       // Combine all JSON data into a single object
//       const combinedData = {
//         bills: {},
//         invoice: {},
//         purchaseOrder: {},
//       };

//       uploadedData.forEach((data, index) => {
//         const filename = `file${index + 1}`;
//         if (data.bills) {
//           combinedData.bills[filename] = data.bills[Object.keys(data.bills)[0]];
//         }
//         if (data.invoice) {
//           combinedData.invoice[filename] = data.invoice[Object.keys(data.invoice)[0]];
//         }
//         if (data.purchaseOrder) {
//           combinedData.purchaseOrder[filename] = data.purchaseOrder[Object.keys(data.purchaseOrder)[0]];
//         }
//       });

//       // Store the JSON data in the state
//       setJsonData(combinedData);

//       alert('Files uploaded and processed successfully!');
//     } catch (error) {
//       console.error("Error during upload and processing:", error.response?.data || error.message);
//       alert("An error occurred during processing. Please try again.");
//     }
//   };

//   const handleColumnSelection = (table, column) => {
//     setSelectedColumns((prev) => ({
//       ...prev,
//       [table]: prev[table].includes(column)
//         ? prev[table].filter((col) => col !== column)
//         : [...prev[table], column],
//     }));
//   };

//   const handleGenerateExcel = async () => {
//     try {
//       const response = await axios.post('http://localhost:13889/paperless/generate-excel', {
//         selectedColumns,
//         fileId,
//       });

//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', 'output.xlsx');
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//     } catch (error) {
//       console.error("Error generating Excel file:", error.response?.data || error.message);
//       alert("An error occurred while generating the Excel file.");
//     }
//   };

//   return (
//     <div className="container">
//       <h1>Documents To Excel</h1>
//       <p>Convert purchase orders, quotations, and receipts into Excel files quickly and easily.</p>

//       <input type="file" multiple onChange={handleFileChange} />
//       <button onClick={handleUpload}>Add File(s)</button>

//       {fileId && (
//         <div className="column-selection">
//           <h2>Select Columns for Each Table</h2>
//           {['bills', 'invoice', 'purchaseOrder'].map((table) => (
//             <div key={table}>
//               <h3>{table}</h3>
//               {selectedColumns[table]?.map((column) => (
//                 <label key={column}>
//                   <input
//                     type="checkbox"
//                     checked={selectedColumns[table]?.includes(column)}
//                     onChange={() => handleColumnSelection(table, column)}
//                   />
//                   {column}
//                 </label>
//               ))}
//             </div>
//           ))}
//           <button onClick={handleGenerateExcel}>Generate Excel File</button>
//         </div>
//       )}

//       {jsonData && (
//         <div className="json-output">
//           <h2>Processed JSON Data</h2>
//           <pre>{JSON.stringify(jsonData, null, 2)}</pre>
//         </div>
//       )}
//     </div>
//   );
// };

// export default HomePage;



// import React, { useState } from 'react';
// import axios from 'axios';

// const HomePage = () => {
//   const [files, setFiles] = useState([]);
//   const [processing, setProcessing] = useState(false);
//   const [fileID, setFileID] = useState(null);
//   const [jsonData, setJsonData] = useState(null);

//   const handleFileChange = (e) => {
//     setFiles([...e.target.files]);
//   };

//   const handleUpload = async () => {
//     if (files.length === 0) {
//       alert("Please select at least one file!");
//       return;
//     }
//     setProcessing(true);
//     const formData = new FormData();
//     files.forEach(file => {
//       formData.append('files', file);
//     });
//     // If needed, add user info (e.g., username) here:
//     formData.append('username', 'testuser');

//     try {
//       // Assuming your backend is running on port 13889
//       const response = await axios.post('http://localhost:13889/paperless/process', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });
//       setFileID(response.data.file_ID);
//       setJsonData(response.data);
//       alert("Files processed successfully!");
//     } catch (error) {
//       console.error("Error processing files:", error);
//       alert("Failed to process files.");
//     } finally {
//       setProcessing(false);
//     }
//   };

//   // (Later) You can add UI elements here for the user to select columns for each type,
//   // then a button to trigger an API that creates an Excel file (using exceljs on the backend)
//   // and then download that file.

//   return (
//     <div className="container">
//       <h1>Documents To Excel</h1>
//       <input type="file" multiple onChange={handleFileChange} />
//       <button onClick={handleUpload} disabled={processing}>
//         {processing ? "Processing..." : "Upload and Process"}
//       </button>
//       {fileID && (
//         <div>
//           <p>Processed File ID: {fileID}</p>
//           {/* Here you can show options to choose columns per document type */}
//         </div>
//       )}
//       {jsonData && (
//         <div>
//           <h2>Extracted JSON Data</h2>
//           <pre>{JSON.stringify(jsonData, null, 2)}</pre>
//         </div>
//       )}
//     </div>
//   );
// };

// export default HomePage;


// HomePage.js
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
