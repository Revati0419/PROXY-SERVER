const express = require('express');
const cors = require('cors');
const translateRoute = require('./api/translate');

const app = express();

// ✅ CORS setup: allow any frontend to call this API
app.use(cors({
  origin: '*', // Change '*' to your frontend URL if you want to restrict
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ JSON body parser
app.use(express.json());

// ✅ Routes
app.use('/api/translate', translateRoute);

// ✅ Test endpoint
app.get('/', (req, res) => {
  res.send('✅ Proxy server is running');
});

// ✅ Start server (Vercel will handle the actual port)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
