const { PurchaseOrder } = require('../models/PurchaseOrder');
const excel = require('exceljs');

exports.storePurchaseOrders = async (req, res) => {
    const { files, fileId } = req.body;

    try {
        const savedPurchaseOrders = [];

        for (const file of files) {
            if (file.type === 'purchaseOrder') {
                console.log('Storing Purchase Order:', file); // Log the file data
                const newPurchaseOrder = await PurchaseOrder.create({ ...file, file_ID: fileId });
                savedPurchaseOrders.push(newPurchaseOrder);
            }
        }

        res.status(200).json({ message: 'Purchase orders stored successfully', savedPurchaseOrders });
    } catch (error) {
        console.error('Error storing purchase orders:', error); // Log the error
        res.status(500).json({ error: 'Failed to store purchase orders' });
    }
};

exports.generatePurchaseOrderExcel = async (req, res) => {
    const { selectedColumns, fileId } = req.body;

    try {
        const workbook = new excel.Workbook();
        const purchaseOrderSheet = workbook.addWorksheet('PurchaseOrders');

        // Fetch purchase orders data from the database for the specific fileId
        const purchaseOrders = await PurchaseOrder.findAll({ where: { file_ID: fileId } });

        // Add columns and data to the sheet
        addDataToSheet(purchaseOrderSheet, purchaseOrders, selectedColumns);

        // Write the workbook to a buffer
        const buffer = await workbook.xlsx.writeBuffer();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=purchase_orders.xlsx');
        res.send(buffer);
    } catch (error) {
        console.error('Error generating Excel file for purchase orders:', error);
        res.status(500).json({ error: 'Failed to generate Excel file for purchase orders' });
    }
};

const addDataToSheet = (sheet, data, columns) => {
    sheet.addRow(columns);
    data.forEach(item => {
        const row = columns.map(column => item[column]);
        sheet.addRow(row);
    });
};