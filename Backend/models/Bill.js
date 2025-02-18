const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Project = require('./Project');

const Bill = sequelize.define('Bill', {
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
  receipt_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  receipt_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  payment_description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  payer_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  payment_method: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  amount_paid: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
}
, {
    tableName: 'bill',
    timestamps: false,
});

module.exports = Bill;
