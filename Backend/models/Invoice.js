const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Project = require('./Project');

const Invoice = sequelize.define('Invoice', {
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
  invoice_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  invoice_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  seller_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  buyer_name: {
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
  all_total_before_tax: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: true,
  },
  vat: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: true,
  },
  all_total_amount_including_VAT: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: true,
  },
  payment_terms: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  payment_method: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'Invoice',
  timestamps: false,
});

module.exports = Invoice;
