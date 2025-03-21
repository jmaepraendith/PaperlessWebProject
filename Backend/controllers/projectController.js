const excelJS = require('exceljs');
const Project = require('../models/Project');
const Bill = require('../models/Bill');
const Invoice = require('../models/Invoice');
const PurchaseOrder = require('../models/PurchaseOrder');
const sequelize = require('../config/database');
const fs = require('fs');
const path = require('path');


exports.allcolumnExcelFile = async (req, res) => {
   
        try {
            const { file_ID } = req.params;
    
            const project = await Project.findOne({ where: { file_ID } });
            if (!project) {
                return res.status(404).json({ message: "Project not found" });
            }
    
            const bills = await Bill.findAll({ where: { file_ID } });
            const invoices = await Invoice.findAll({ where: { file_ID } });
            const purchaseOrders = await PurchaseOrder.findAll({ where: { file_ID } });
    
            const workbook = new excelJS.Workbook();
    
            const addSheet = (workbook, sheetName, data) => {
                const worksheet = workbook.addWorksheet(sheetName);
                if (data.length > 0) {
                    worksheet.columns = Object.keys(data[0].dataValues).map(key => ({
                        header: key,
                        key: key,
                        width: 20
                    }));
                    data.forEach(item => worksheet.addRow(item.dataValues));
                }
            };
    
            // Add data to sheets
            addSheet(workbook, 'Bills', bills);
            addSheet(workbook, 'Invoices', invoices);
            addSheet(workbook, 'Purchase Orders', purchaseOrders);
    
            // Set response headers
            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader(
                "Content-Disposition",
                `attachment; filename=Project_${file_ID}.xlsx`
            );
    
            await workbook.xlsx.write(res);
            res.end();
    
        } catch (error) {
            console.error("Error exporting to Excel:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
};
    



exports.exportToExcelFile = async (req, res) => {
    try {
        const { file_ID } = req.params; // Ensure param matches frontend
        const { selectedData } = req.body; // Destructure properly

        console.log("Processing Excel export for file ID:", file_ID);
        console.log("Selected Tables & Columns:", selectedData);

        if (!selectedData || selectedData.length === 0) {
            return res.status(400).json({ message: "No columns selected for export" });
        }

        // Validate project exists
        const project = await Project.findOne({ where: { file_ID } }); // Ensure consistency
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Fetch data from relevant tables
        const bills = await Bill.findAll({ where: {  file_ID } });
        const invoices = await Invoice.findAll({ where: {  file_ID } });
        const purchaseOrders = await PurchaseOrder.findAll({ where: {  file_ID } });

        const workbook = new excelJS.Workbook();

        const addSheet = (workbook, sheetName, data, selectedColumns) => {
            if (data.length > 0 && selectedColumns.length > 0) {
                console.log(`Adding sheet: ${sheetName} with ${selectedColumns.length} columns`);
                const worksheet = workbook.addWorksheet(sheetName);

                worksheet.columns = selectedColumns.map(col => ({
                    header: col,
                    key: col,
                    width: 20
                }));

                data.forEach(item => {
                    const row = {};
                    selectedColumns.forEach(col => {
                        row[col] = item[col] !== undefined ? item[col] : "N/A";
                    });
                    worksheet.addRow(row);
                });
            }
        };

        let sheetsAdded = 0;
        for (const { table, selectedColumns } of selectedData) {
            if (table === "Bill" && bills.length > 0) {
                addSheet(workbook, 'Bills', bills, selectedColumns);
                sheetsAdded++;
            }
            if (table === "Invoice" && invoices.length > 0) {
                addSheet(workbook, 'Invoices', invoices, selectedColumns);
                sheetsAdded++;
            }
            if (table === "PurchaseOrder" && purchaseOrders.length > 0) {
                addSheet(workbook, 'Purchase Orders', purchaseOrders, selectedColumns);
                sheetsAdded++;
            }
        }

        if (sheetsAdded === 0) {
            return res.status(404).json({ message: "No relevant data found for export" });
        }

    
        const exportDir = path.join(__dirname, '../../exports');
        if (!fs.existsSync(exportDir)) {
            fs.mkdirSync(exportDir, { recursive: true });
        }

        // Save Excel file
        const filePath = path.join(exportDir, `Project_${file_ID}.xlsx`);
        await workbook.xlsx.writeFile(filePath);

        console.log(`Excel file saved at: ${filePath}`);

        // Send success response
        res.status(200).json({ message: "Excel file created successfully!", filePath });

    } catch (error) {
        console.error("Error exporting to Excel:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.getExcelFile = async (req, res) => {
    try {
        const { file_ID } = req.params;

        if (!file_ID) {
            return res.status(400).json({ message: "File ID is required." });
        }

        const filePath = path.join(__dirname, '../../exports', `Project_${file_ID}.xlsx`);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: "Excel file not found." });
        }

        res.download(filePath, `Project_${file_ID}.xlsx`, (err) => {
            if (err) {
                console.error("Error sending file:", err);
                res.status(500).json({ message: "Failed to download Excel file." });
            }
        });

    } catch (error) {
        console.error("Error retrieving Excel file:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};




exports.getDataEachTable_File_ID = async (req, res) => {
    try {
        const { file_ID } = req.params;

        const project = await Project.findOne({ where: { file_ID } });
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        const bills = await Bill.findAll({ where: { file_ID } });
        const invoices = await Invoice.findAll({ where: { file_ID } });
        const purchaseOrders = await PurchaseOrder.findAll({ where: { file_ID } });

        res.json({
            bills: bills.map(b => b.dataValues),
            invoices: invoices.map(i => i.dataValues),
            purchaseOrders: purchaseOrders.map(po => po.dataValues)
        });

    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


exports.getAllProject = async (req, res) => {
    try {
        const { username } = req.params;

        const projects = await Project.findAll({
            where: { username },
            attributes: ['file_ID', 'file_name', 'create_date', 'update_date', 'username'],
            order: [
                ['update_date', 'DESC'],  // Sort by update_date first
                ['create_date', 'DESC']   // If update_date is null, sort by create_date
            ]
        });

        if (!projects || projects.length === 0) {
            return res.status(404).json({ message: `${username} didn't create any project yet.` });
        }

        const formatDate = (date) => {
            if (!date) return null;
            return new Intl.DateTimeFormat('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }).format(new Date(date));
        };

        // Map through projects and modify file_name if it's null
        const formattedProjects = projects.map(project => ({
            file_ID: project.file_ID,
            file_name: project.file_name ? project.file_name : project.file_ID, // Use file_ID if file_name is null
            date: project.update_date ? formatDate(project.update_date) : formatDate(project.create_date),
            create_date: project.create_date,
            update_date: project.update_date,
            username: project.username
        }));

        res.json(formattedProjects);
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


exports.updateFileName = async (req, res) => {
    try {
        const { file_ID } = req.params;
        const { file_name } = req.body;

        const project = await Project.findOne({ where: { file_ID } });
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        
        const update_date = new Date();
        await Project.update({ file_name,update_date }, { where: { file_ID } });
       
        res.json({ message: "File name updated successfully" });
    } catch (error) {
        console.error("Error updating file name:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


exports.getColumnEachTable = async (req, res) => {
    try {
        const { file_ID } = req.params;

        // Check if file_ID exists in the Project table
        const project = await Project.findOne({ where: { file_ID } });
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Check which tables contain the file_ID
        const billExists = await Bill.findOne({ where: { file_ID } });
        const invoiceExists = await Invoice.findOne({ where: { file_ID } });
        const purchaseOrderExists = await PurchaseOrder.findOne({ where: { file_ID } });

        let tablesWithfile_ID = [];
        if (billExists) tablesWithfile_ID.push("Bill");
        if (invoiceExists) tablesWithfile_ID.push("Invoice");
        if (purchaseOrderExists) tablesWithfile_ID.push("PurchaseOrder");

        // Fetch columns dynamically for each identified table
        const ColumnEachTable = await Promise.all(
            tablesWithfile_ID.map(async (tableName) => {
                const tableColumns = await sequelize.getQueryInterface().describeTable(tableName);
                return {
                    table: tableName,
                    columns: Object.keys(tableColumns) // Extract column names
                };
            })
        );

        return res.status(200).json(ColumnEachTable);
    } catch (error) {
        console.error("Error fetching columns:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};









