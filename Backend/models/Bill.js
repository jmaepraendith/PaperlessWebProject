const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Project = require('./Project');

const Bill = sequelize.define('Bill', {
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
  receipt_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  receipt_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  payment_description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  payer_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  payment_method: {
    type: DataTypes.ENUM('Cash', 'Credit', 'Transfer'),
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
  amount_paid: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: true,
  },
}, {
  tableName: 'bill',
  timestamps: false,
});

module.exports = Bill;
