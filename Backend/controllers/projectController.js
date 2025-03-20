const excelJS = require('exceljs');
const Project = require('../models/Project');
const Bill = require('../models/Bill');
const Invoice = require('../models/Invoice');
const PurchaseOrder = require('../models/PurchaseOrder');

exports.exportToExcelFile = async (req, res) => {
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

