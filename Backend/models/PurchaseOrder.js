const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Project = require('./Project');

const PurchaseOrder = sequelize.define('PurchaseOrder', {
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
  product_description: {
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
  total_price: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  order_status: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  delivery_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  supplier_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}
, {
    tableName: 'purchaseOrder',
    timestamps: false,
});

module.exports = PurchaseOrder;
