// controllers/ocrController.js
const axios = require('axios');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const FormData = require('form-data');
const Project = require('../models/Project');
const Bill = require('../models/Bill');
const Invoice = require('../models/Invoice');
const PurchaseOrder = require('../models/PurchaseOrder');

// Configure multer to store files temporarily
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'temp_uploads/');
  },
  filename: (req, file, cb) => {
    // cb(null, Date.now() + '-' + file.originalname);
    cb(null, req.body.username + '-' + file.originalname);
  }
});
const upload = multer({ storage });

exports.processFiles = [
  upload.array('files'),
  async (req, res) => {
    try {
      // Forward files to Python OCR service using a stream for each file.
      const formData = new FormData();
      req.files.forEach(file => {
        // Use fs.createReadStream(file.path) to properly send the file data.
        formData.append('files', fs.createReadStream(file.path));
      });
      
      // const response = await axios.post('http://localhost:5000/process', formData, { 
      const response = await axios.post('http://localhost:5001/extract', formData, {
        headers: formData.getHeaders()
      });
      
      const ocrResults = response.data; // JSON with keys: bills, invoices, purchaseOrders, unknown
      
      // Create a new file_ID (project ID) for this batch
      const file_ID = uuidv4();
      const projectData = {
        file_ID,
        username: req.body.username,  
        create_date: new Date(),
        update_date: null,
      };
      // Create project record
      await Project.create(projectData);

      // Insert each extracted record into its table
      for (const bill of ocrResults.bills) {
        await Bill.create({
          file_ID,
          fileimagename: bill.file_image_name,
          receipt_number: bill.receipt_number,
          receipt_date: bill.receipt_date,  // conversion to DATE if needed
          amount_paid: bill.amount_paid,
          payment_method: bill.payment_method,
          payer_name: bill.payer_name,
          payment_description: bill.payment_description,
        });
      }
      for (const invoice of ocrResults.invoices) {
        await Invoice.create({
          file_ID,
          fileimagename: invoice.file_image_name,
          invoice_number: invoice.invoice_number,
          invoice_date: invoice.invoice_date,
          seller_name: invoice.seller_name,
          buyer_name: invoice.buyer_name,
          description: invoice.description,
          quantity: invoice.quantity,
          unit_price: invoice.unit_price,
          total_before_tax: invoice.total_before_tax,
          vat: invoice.vat,
          total_amount_including_VAT: invoice.total_amount_including_VAT,
          payment_terms: invoice.payment_terms,
          payment_method: invoice.payment_method,
        });
      }
      for (const po of ocrResults.purchaseOrders) {
        await PurchaseOrder.create({
          file_ID,
          fileimagename: po.file_image_name,
          purchase_order_number: po.purchase_order_number,
          order_date: po.order_date,
          customer_name: po.customer_name,
          product_description: po.product_description,
          quantity: po.quantity,
          unit_price: po.unit_price,
          total_price: po.total_price,
          supplier_name: po.supplier_name,
          order_status: po.order_status,
          delivery_date: po.delivery_date,
        });
      }
      
      // Optionally, return a response with the new file_ID
      res.status(200).json({ message: "Files processed and data stored.", file_ID });
    } catch (error) {
      console.error("Error processing files:", error);
      res.status(500).json({ error: "Failed to process files." });
    }
  }
];


