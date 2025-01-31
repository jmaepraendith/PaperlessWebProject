// require('dotenv').config();
// const express = require('express');
// const multer = require('multer');
// const axios = require('axios');
// const cors = require('cors');
// const db = require('./db/db_config');
// const fs = require('fs');

// const app = express();
// const upload = multer({ dest: 'uploads/' });

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Upload API
// app.post('/upload', upload.single('file'), async (req, res) => {
//     try {
//         const filePath = req.file.path;

//         // Send file to Python service for processing
//         const pythonResponse = await axios.post('http://localhost:5000/process', fs.createReadStream(filePath), {
//             headers: { 'Content-Type': 'multipart/form-data' }
//         });

//         const extractedData = pythonResponse.data;

//         // Save extracted data to the database
//         const sql = `
//             INSERT INTO invoices (invoice_number, buyer_name, seller_name, invoice_date, quantity, unit_price, total_before_tax, vat, total_amount_including_VAT, payment_terms, payment_method, file_ID)
//             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//         `;
//         db.query(sql, [
//             extractedData.invoice_number,
//             extractedData.buyer_name,
//             extractedData.seller_name,
//             extractedData.invoice_date,
//             extractedData.quantity,
//             extractedData.unit_price,
//             extractedData.total_before_tax,
//             extractedData.vat,
//             extractedData.total_amount_including_VAT,
//             extractedData.payment_terms,
//             extractedData.payment_method,
//             req.file.filename
//         ], (err) => {
//             if (err) {
//                 console.error('Database Error:', err);
//                 return res.status(500).send('Database Error');
//             }
//             res.status(200).send({ message: 'File processed and saved successfully!' });
//         });

//         fs.unlinkSync(filePath); // Clean up file
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).send('Error processing the file');
//     }
// });

// // Start Backend Server
// app.listen(13449, () => console.log('Backend running on http://localhost:13449'));

const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const sequelize = require('./config/database');
const server = http.createServer(app);
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  });

const PORT = process.env.PORT || 13889;
sequelize.sync().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to sync database:', error);
});

