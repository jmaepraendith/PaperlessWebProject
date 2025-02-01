const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const router = express.Router();

app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:3000' }));

const sequelize = require('./config/database');
const server = http.createServer(app);

// Import and use the routes
const routes = require('./routes');
app.use('/paperless', routes);

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT;
sequelize.sync().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to sync database:', error);
});