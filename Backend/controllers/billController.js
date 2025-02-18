const { Bills } = require('../models/Bill');
const excel = require('exceljs');

exports.storeBills = async (req, res) => {
    const { files, fileId } = req.body;

    try {
        const savedBills = [];

        for (const [filename, data] of Object.entries(files)) {
            const newBill = await Bills.create({ ...data, file_ID: fileId });
            savedBills.push(newBill);
        }

        res.status(200).json({ message: 'Bills stored successfully', savedBills });
    } catch (error) {
        console.error('Error storing bills:', error);
        res.status(500).json({ error: 'Failed to store bills' });
    }
};

exports.generateBillExcel = async (req, res) => {
    const { selectedColumns, fileId } = req.body;

    try {
        const workbook = new excel.Workbook();
        const billsSheet = workbook.addWorksheet('Bills');

        // Fetch bills data from the database for the specific fileId
        const bills = await Bills.findAll({ where: { file_ID: fileId } });

        // Add columns and data to the sheet
        addDataToSheet(billsSheet, bills, selectedColumns);

        // Write the workbook to a buffer
        const buffer = await workbook.xlsx.writeBuffer();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=bills.xlsx');
        res.send(buffer);
    } catch (error) {
        console.error('Error generating Excel file for bills:', error);
        res.status(500).json({ error: 'Failed to generate Excel file for bills' });
    }
};

const addDataToSheet = (sheet, data, columns) => {
    sheet.addRow(columns);
    data.forEach(item => {
        const row = columns.map(column => item[column]);
        sheet.addRow(row);
    });
};