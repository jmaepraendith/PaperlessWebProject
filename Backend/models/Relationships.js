const User = require('../models/User');
const Project = require('../models/Project');
const Invoice = require('../models/Invoice');
const Bills = require('../models/Bill');
const PurchaseOrder = require('../models/PurchaseOrder');

// Define relationships
User.hasMany(Project, { foreignKey: 'username' });
Project.belongsTo(User, { foreignKey: 'username' });

Project.hasMany(Invoice, { foreignKey: 'file_ID' });
Invoice.belongsTo(Project, { foreignKey: 'file_ID' });

Project.hasMany(Bills, { foreignKey: 'file_ID' });
Bills.belongsTo(Project, { foreignKey: 'file_ID' });

Project.hasMany(PurchaseOrder, { foreignKey: 'file_ID' });
PurchaseOrder.belongsTo(Project, { foreignKey: 'file_ID' });

module.exports = { User, Project, Invoice, Bills, PurchaseOrder };
