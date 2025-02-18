const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Project = require('./Project');

const Invoice = sequelize.define('Invoice', {
  file_ID: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
        model: Project,
        key: 'file_ID',
    },
  },
  index_file: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  fileimagename: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  buyer_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  seller_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  invoice_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  invoice_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  unit_price: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  total_before_tax: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  vat: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  total_amount_including_VAT: {
    type: DataTypes.FLOAT,
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
    tableName: 'invoice',
    timestamps: false,
}
);

module.exports = Invoice;
