const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Project = sequelize.define('Project', {
    file_ID: {
        type: DataTypes.STRING,
        primaryKey: true,
        autoIncrement: true,
    },
    create_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    update_date: {
        type: DataTypes.DATE,
    },
    file_name: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: User,
            key: 'username',
        },
    },
}, {
    tableName: 'project',
    timestamps: false,
});

module.exports = Project;
