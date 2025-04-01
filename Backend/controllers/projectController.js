const excelJS = require('exceljs');
const Project = require('../models/Project');
const Bill = require('../models/Bill');
const Invoice = require('../models/Invoice');
const PurchaseOrder = require('../models/PurchaseOrder');
const sequelize = require('../config/database');


exports.allcolumnExcelFile = async (req, res) => {
    try {
        const { file_ID } = req.params;

        const project = await Project.findOne({ where: { file_ID } });
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Fetch only tables that contain data for the given file_ID
        const tablesWithData = [];

        const bills = await Bill.findAll({ where: { file_ID } });
        if (bills.length > 0) tablesWithData.push({ name: "Bills", data: bills });

        const invoices = await Invoice.findAll({ where: { file_ID } });
        if (invoices.length > 0) tablesWithData.push({ name: "Invoices", data: invoices });

        const purchaseOrders = await PurchaseOrder.findAll({ where: { file_ID } });
        if (purchaseOrders.length > 0) tablesWithData.push({ name: "Purchase Orders", data: purchaseOrders });

        // If no tables have data, return an error
        if (tablesWithData.length === 0) {
            return res.status(404).json({ message: "No relevant data found for export" });
        }

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

        // Add only tables that have data
        tablesWithData.forEach(table => addSheet(workbook, table.name, table.data));

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
                ['update_date', 'DESC'],  
                ['create_date', 'DESC']   
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
            file_name: project.file_name ? project.file_name : project.file_ID, 
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

        const project = await Project.findOne({ where: { file_ID } });
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        const billExists = await Bill.findOne({ where: { file_ID } });
        const invoiceExists = await Invoice.findOne({ where: { file_ID } });
        const purchaseOrderExists = await PurchaseOrder.findOne({ where: { file_ID } });

        let tablesWithfile_ID = [];
        if (billExists) tablesWithfile_ID.push("Bill");
        if (invoiceExists) tablesWithfile_ID.push("Invoice");
        if (purchaseOrderExists) tablesWithfile_ID.push("PurchaseOrder");

        const ColumnEachTable = await Promise.all(
            tablesWithfile_ID.map(async (tableName) => {
                const tableColumns = await sequelize.getQueryInterface().describeTable(tableName);
                return {
                    table: tableName,
                    columns: Object.keys(tableColumns).map(col => col.replace(/_/g, ' ')) // Extract column names
                };
            })
        );

        return res.status(200).json(ColumnEachTable);
    } catch (error) {
        console.error("Error fetching columns:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.exportToExcelFile = async (req, res) => {
    try {
        const { file_ID } = req.params; 
        const { selectedData } = req.body; 

        console.log("Processing Excel export for file ID:", file_ID);
        console.log("Selected Tables & Columns:", selectedData);

        if (!selectedData || selectedData.length === 0) {
            return res.status(400).json({ message: "No columns selected for export" });
        }

        const project = await Project.findOne({ where: { file_ID } }); 
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

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
                    selectedColumns.forEach(displayCol => {
                        const dbCol = displayCol.replace(/ /g, '_'); 
                        row[displayCol] = item[dbCol] !== undefined ? item[dbCol] : "N/A";
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

        res.download(filePath, `Project_${file_ID}.xlsx`, async (err) => {
            if (err) {
                console.error("Error sending file:", err);
                return res.status(500).json({ message: "Failed to download Excel file." });
            }

            console.log(`File sent for download: ${filePath}`);

            // Upload the file to Google Drive after successful download
            const fileUrl = await uploadToGoogleDrive(filePath);
            if (fileUrl) {
                console.log(`File uploaded to Google Drive: ${fileUrl}`);
            } else {
                console.error("Failed to upload file to Google Drive.");
            }
        });

    } catch (error) {
        console.error("Error retrieving Excel file:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};




const { google } = require('googleapis');
const SCOPE = ['https://www.googleapis.com/auth/drive'];
const path = require('path');
const fs = require('fs');
const apikeys = require(path.join(__dirname, '../paperlessAPI.json'));

async function authorize() {
    const jwtClient = new google.auth.JWT(
        apikeys.client_email,
        null,
        apikeys.private_key,
        SCOPE
    );
    await jwtClient.authorize();
    return jwtClient;
}

const uploadToGoogleDrive = async (filePath) => {
    try {
        if (!fs.existsSync(filePath)) {
            console.error("File does not exist:", filePath);
            return null;
        }

        const authClient = await authorize();
        const drive = google.drive({ version: 'v3', auth: authClient });

        const fileMetadata = {
            name: path.basename(filePath),
            // parents: ["11Vz-D_TgIRhkixXY5wr6xZnvqejx2Lxe"], //  folder ID jj
            parents: ["1C5bpzb5kU4K2a4MlyecLTk8BvxjClQri"], //  folder ID jp
        };

        const media = {
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            body: fs.createReadStream(filePath),
        };

        const file = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id',
        });

        await drive.permissions.create({
            fileId: file.data.id,
            requestBody: {
                role: 'writer',
                type: 'anyone',
            },
        });

        const fileUrl = `https://drive.google.com/file/d/${file.data.id}/view`;

        console.log("File uploaded to Google Drive:", fileUrl);

        // Delete the file after successful upload
        fs.unlinkSync(filePath);
        console.log("File deleted from local exports folder:", filePath);

        return fileUrl;

    } catch (error) {
        console.error("Error uploading to Google Drive:", error);
        return null;
    }
};


exports.getFileLinkfromDrive = async (req, res) => {
    try {
        const { file_ID } = req.params;

        if (!file_ID) {
            return res.status(400).json({ message: "File ID is required." });
        }

        const authClient = await authorize();
        const drive = google.drive({ version: 'v3', auth: authClient });

        const fileName = `Project_${file_ID}.xlsx`;
        const response = await drive.files.list({
            q: `name='${fileName}' and trashed=false`,
            fields: 'files(id, name)',
        });

        if (response.data.files.length === 0) {
            return res.status(404).json({ message: "File not found on Google Drive." });
        }

        const fileId = response.data.files[0].id;
        const fileUrl = `https://drive.google.com/file/d/${fileId}/view`;

        res.json({ fileUrl });

    } catch (error) {
        console.error("Error fetching file from Google Drive:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};



exports.deleteRecordsbyfileID = async (req, res) => {
    try {
        const { file_ID } = req.params;

        if (!file_ID) {
            return res.status(400).json({ message: "File ID is required." });
        }

        const billCount = await Bill.count({ where: { file_ID } });
        if (billCount > 0) {
            await Bill.destroy({ where: { file_ID } });
        }

        const invoiceCount = await Invoice.count({ where: { file_ID } });
        if (invoiceCount > 0) {
            await Invoice.destroy({ where: { file_ID } });
        }

        const purchaseOrderCount = await PurchaseOrder.count({ where: { file_ID } });
        if (purchaseOrderCount > 0) {
            await PurchaseOrder.destroy({ where: { file_ID } });
        }

        await Project.destroy({ where: { file_ID } });


        const authClient = await authorize();
        const drive = google.drive({ version: 'v3', auth: authClient });

        const fileName = `Project_${file_ID}.xlsx`;

        // Find the file in Google Drive
        const response = await drive.files.list({
            q: `name='${fileName}' and trashed=false`,
            fields: 'files(id, name)',
        });

        if (response.data.files.length === 0) {
            console.log(`File ${fileName} not found on Google Drive.`);
            return res.status(200).json({ message: "Project deleted, but no matching file found in Google Drive." });
        }
        const fileId = response.data.files[0].id;
        await drive.files.delete({ fileId });

        return res.status(200).json({ message: "Your project has been deleted successfully"});

    } catch (error) {
        console.error("Error deleting records:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};



exports.getExcelFileGuest = async (req, res) => {
    try {
        const { file_ID } = req.params;

        if (!file_ID) {
            return res.status(400).json({ message: "File ID is required." });
        }

        const filePath = path.join(__dirname, '../../exports', `Project_${file_ID}.xlsx`);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: "Excel file not found." });
        }

        res.download(filePath, `Project_${file_ID}.xlsx`, async (err) => {
            if (err) {
                console.error("Error sending file:", err);
                return res.status(500).json({ message: "Failed to download Excel file." });
            }

            console.log(`File sent for download: ${filePath}`);

            // after successful download
            // Delete the file after successful download
            fs.unlinkSync(filePath);
            console.log("File deleted from local exports folder:", filePath);
    
            const billCount = await Bill.count({ where: { file_ID } });
            if (billCount > 0) {
                await Bill.destroy({ where: { file_ID } });
            }
    
            const invoiceCount = await Invoice.count({ where: { file_ID } });
            if (invoiceCount > 0) {
                await Invoice.destroy({ where: { file_ID } });
            }
    
            const purchaseOrderCount = await PurchaseOrder.count({ where: { file_ID } });
            if (purchaseOrderCount > 0) {
                await PurchaseOrder.destroy({ where: { file_ID } });
            }
    
            await Project.destroy({ where: { file_ID } });
        });

    } catch (error) {
        console.error("Error retrieving Excel file:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

