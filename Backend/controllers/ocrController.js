const axios = require('axios');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const FormData = require('form-data');
const Project = require('../models/Project');
const Bill = require('../models/Bill');
const Invoice = require('../models/Invoice');
const PurchaseOrder = require('../models/PurchaseOrder');

// store files temporarily
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'temp_uploads/'); // this folder have to exists
  },
  filename: (req, file, cb) => {
    cb(null, req.body.username + '-' + file.originalname);
  }
});
const upload = multer({ storage });

function extractJsonObjects(ocrResults) {
  let dataStr = "";
  
  // If ocrResults is a string, use it directly.
  if (typeof ocrResults === "string") {
    dataStr = ocrResults;
  }
  // If it's an array (each element with a "formatted_data" field), combine.
  else if (Array.isArray(ocrResults)) {
    dataStr = ocrResults.map(item => item.formatted_data).join("\n");
  }
  // If it's an object with a formatted_data property, use that.
  else if (ocrResults && ocrResults.formatted_data) {
    dataStr = ocrResults.formatted_data;
  } else {
    console.error("Unknown format for OCR results");
    return [];
  }

  const jsonObjects = [];
  
  // Use a regular expression to extract JSON code blocks wrapped in ```json ... ```
  const codeFenceRegex = /```json\s*([\s\S]*?)\s*```/gm;
  let matches = [];
  let match;
  while ((match = codeFenceRegex.exec(dataStr)) !== null) {
    matches.push(match[1]);
  }
  
  // If no code fence blocks were found, push the entire dataStr.
  if (matches.length === 0) {
    matches.push(dataStr);
  }
  
  // Parse each JSON block
  for (const jsonStr of matches) {
    try {
      const parsed = JSON.parse(jsonStr);
      // If the parsed JSON is an array, add each element individually.
      if (Array.isArray(parsed)) {
        jsonObjects.push(...parsed);
      } else {
        jsonObjects.push(parsed);
      }
    } catch (error) {
      console.error("Error parsing JSON block:", jsonStr, error);
    }
  }
  
  return jsonObjects;
}



exports.processFiles = [
  upload.array('files'),
  async (req, res) => {
    try {
      
      const file_ID = uuidv4();

      // Create a Project 
      const projectData = {
        file_ID,
        username: req.body.username,
        create_date: new Date(),
        update_date: null,
      };
      await Project.create(projectData);

      // Forward files to Python OCR service 
      const formData = new FormData();
      req.files.forEach(file => {
        formData.append('files', fs.createReadStream(file.path));
      });

      // Call the Python OCR service
      const response = await axios.post('http://localhost:5001/extract', formData, {
        headers: formData.getHeaders(),
      });

      // The OCR service returns a JSON
      const rawocrResults = response.data;
      let ocrResults = extractJsonObjects(rawocrResults);
      console.log("Extracted OCR Results:", ocrResults);

      // Flatten the result in case it's nested
      ocrResults = Array.isArray(ocrResults[0]) ? ocrResults.flat() : ocrResults;

      // Process each extracted JSON object based on its file_type
      for (const lineItem of ocrResults) {
        if (lineItem.file_type === 'Bill') {
          await Bill.create({
            file_ID,
            file_type: lineItem.file_type,
            fileimagename: lineItem.fileimagename,
            receipt_number: lineItem.receipt_number,
            receipt_date: lineItem.receipt_date,
            payment_description: lineItem.payment_description,
            payer_name: lineItem.payer_name,
            payment_method: lineItem.payment_method,
            product_item: lineItem.product_item,
            description: lineItem.description,
            quantity: lineItem.quantity,
            unit_price: lineItem.unit_price,
            total_product_price: lineItem.total_product_price,
            all_product_total_price: lineItem.all_product_total_price,
            amount_paid: lineItem.amount_paid,
          });
        } else if (lineItem.file_type === 'Invoice') {
          await Invoice.create({
            file_ID,
            file_type: lineItem.file_type,
            fileimagename: lineItem.fileimagename,
            invoice_number: lineItem.invoice_number,
            invoice_date: lineItem.invoice_date,
            seller_name: lineItem.seller_name,
            buyer_name: lineItem.buyer_name,
            product_item: lineItem.product_item,
            description: lineItem.description,
            quantity: lineItem.quantity,
            unit_price: lineItem.unit_price,
            total_product_price: lineItem.total_product_price,
            all_total_before_tax: lineItem.all_total_before_tax,
            vat: lineItem.vat,
            all_total_amount_including_VAT: lineItem.all_total_amount_including_VAT,
            payment_terms: lineItem.payment_terms,
            payment_method: lineItem.payment_method,
          });
        } else if (lineItem.file_type === 'Purchase order') {
          await PurchaseOrder.create({
            file_ID,
            file_type: lineItem.file_type,
            fileimagename: lineItem.fileimagename,
            purchase_order_number: lineItem.purchase_order_number,
            order_date: lineItem.order_date,
            customer_name: lineItem.customer_name,
            product_item: lineItem.product_item,
            description: lineItem.description,
            quantity: lineItem.quantity,
            unit_price: lineItem.unit_price,
            total_product_price: lineItem.total_product_price,
            all_product_total_price: lineItem.all_product_total_price,
            supplier_name: lineItem.supplier_name,
            order_status: lineItem.order_status,
            delivery_date: lineItem.delivery_date,
          });
        } else {
          console.log("Unknown file_type encountered:", lineItem.file_type);
        }
      }

      // Clean files
      req.files.forEach(file => {
        fs.unlinkSync(file.path);
      });

      res.status(200).json({
        message: "Files processed and data stored successfully.",
        file_ID,
      });
    } catch (error) {
      console.error("Error processing files:", error);
      res.status(500).json({ error: "Failed to process files." });
    }
  },
];
