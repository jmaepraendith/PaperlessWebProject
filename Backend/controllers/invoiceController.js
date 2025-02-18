const { Invoice } = require('../models/Invoice');
const excel = require('exceljs');

exports.storeInvoices = async (req, res) => {
    const { files, fileId } = req.body;

    try {
        const savedInvoices = [];

        for (const file of files) {
            if (file.type === 'invoice') {
                console.log('Storing Invoice:', file); // Log the file data
                const newInvoice = await Invoice.create({ ...file, file_ID: fileId });
                savedInvoices.push(newInvoice);
            }
        }

        res.status(200).json({ message: 'Invoices stored successfully', savedInvoices });
    } catch (error) {
        console.error('Error storing invoices:', error); // Log the error
        res.status(500).json({ error: 'Failed to store invoices' });
    }
};

exports.generateInvoiceExcel = async (req, res) => {
    const { selectedColumns, fileId } = req.body;

    try {
        const workbook = new excel.Workbook();
        const invoiceSheet = workbook.addWorksheet('Invoices');

        // Fetch invoices data from the database for the specific fileId
        const invoices = await Invoice.findAll({ where: { file_ID: fileId } });

        // Add columns and data to the sheet
        addDataToSheet(invoiceSheet, invoices, selectedColumns);

        // Write the workbook to a buffer
        const buffer = await workbook.xlsx.writeBuffer();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=invoices.xlsx');
        res.send(buffer);
    } catch (error) {
        console.error('Error generating Excel file for invoices:', error);
        res.status(500).json({ error: 'Failed to generate Excel file for invoices' });
    }
};

const addDataToSheet = (sheet, data, columns) => {
    sheet.addRow(columns);
    data.forEach(item => {
        const row = columns.map(column => item[column]);
        sheet.addRow(row);
    });
};