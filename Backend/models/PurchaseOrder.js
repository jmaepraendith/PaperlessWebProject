const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Project = require('./Project');

const PurchaseOrder = sequelize.define('PurchaseOrder', {
  index_file: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  file_ID: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Project,
      key: 'file_ID',
    },
  },
  file_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fileimagename: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  purchase_order_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  order_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  customer_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  product_item: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  unit_price: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: true,
  },
  total_product_price: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: true,
  },
  all_product_total_price: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: true,
  },
  supplier_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  order_status: {
    type: DataTypes.ENUM('Pending','Shipped','Completed'),
    allowNull: true,
  },
  delivery_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'PurchaseOrder',
  timestamps: false,
});

module.exports = PurchaseOrder;
