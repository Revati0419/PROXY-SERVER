const express = require('express');
const cors = require('cors');
const translateRoute = require('./api/translate');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/translate', translateRoute);

app.get('/', (req, res) => {
  res.send('Proxy server is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
