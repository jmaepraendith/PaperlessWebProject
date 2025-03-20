const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:3000' }));

const sequelize = require('./config/database');
const routes = require('./routes');

app.use('/paperless', routes);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 13889;
sequelize.sync().then(() => {
  http.createServer(app).listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to sync database:', error);
});
