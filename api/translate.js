const express = require('express');
const router = express.Router();
const axios = require('axios');


const HF_API_TOKEN = process.env.HF_API_TOKEN;

router.post('/', async (req, res) => {
  const { text } = req.body;

  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/Helsinki-NLP/opus-mt-en-hi',
      {
        inputs: text
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_TOKEN}`,
        }
      }
    );

    const translated = response.data?.[0]?.translation_text || "No translation";

    res.json({ translatedText: translated });
  } catch (error) {
    console.error('Translation error:', error.message);
    res.status(500).json({ error: 'Translation failed' });
  }
});

module.exports = router;
