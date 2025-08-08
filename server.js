require('dotenv').config();
const express = require('express');
const cors = require('cors');
const translateRoute = require('./api/translate');

const app = express();

// Enable CORS for all origins and typical methods
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Mount translation API router
app.use('/api/translate', translateRoute);

// Simple root route for health check
app.get('/', (req, res) => {
  res.send('Proxy server is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
