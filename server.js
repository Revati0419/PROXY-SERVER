const express = require('express');
const cors = require('cors');
const translateRoute = require('./api/translate');

const app = express();

// Allow specific frontend origins (or use "*" for dev)
app.use(cors({
  origin: "*", // or ["chrome-extension://<your-extension-id>", "http://localhost:3000"]
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Handle preflight requests for all routes
app.options("*", cors());

app.use(express.json());
app.use('/api/translate', translateRoute);

app.get('/', (req, res) => {
  res.send('Proxy server is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
