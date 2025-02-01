const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  dialect: 'mysql',
});
sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
  
sequelize.sync({ alter: false })  // `alter: false` prevents Sequelize from trying to add missing columns like timestamps
  .then(() => {
    console.log('Database synced successfully.');
  })
  .catch((error) => {
    console.error('Failed to sync database:', error);
  });

  module.exports = sequelize;

