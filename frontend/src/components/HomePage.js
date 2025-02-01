import React, { useState } from 'react';
import axios from 'axios';

const HomePage = () => {
    const [file, setFile] = useState(null);
    const [output, setOutput] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a file!");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Send file to Python service
            const pythonResponse = await axios.post('http://localhost:5000/process', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // JSON response from Python service
            const extractedData = pythonResponse.data;

            // Send JSON to backend for storage
            const backendResponse = await axios.post('http://localhost:3000/store', extractedData);

            // Display the response from the backend
            setOutput(backendResponse.data);
        } catch (error) {
            console.error("Error during upload:", error);
        }
    };

    return (
        <div className="container">
            <h1>Documents To Excel</h1>
            <p>Convert purchase orders, quotations, and receipts into Excel files quickly and easily</p>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Add File(s)</button>
            {output && (
                <div className="output">
                    <h2>Extracted Data:</h2>
                    <pre>{JSON.stringify(output, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default HomePage;
