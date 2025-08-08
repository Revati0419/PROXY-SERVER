const express = require('express');
const axios = require('axios');
const router = express.Router();

const HF_API_TOKEN = process.env.HF_API_TOKEN;
if (!HF_API_TOKEN) {
    throw new Error("❌ Missing Hugging Face API token");
}


// Handle preflight requests (CORS)
router.options('/', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return res.status(200).end();
});

// Translation endpoint
router.post('/', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { text, targetLang } = req.body || {};

  if (!text || !targetLang) {
    return res.status(400).json({ error: "Missing 'text' or 'targetLang' in request body" });
  }

  try {
    // Supported models map
    const modelMap = {
      hi: 'Helsinki-NLP/opus-mt-en-hi',
      mr: 'Helsinki-NLP/opus-mt-en-mr',
      bn: 'Helsinki-NLP/opus-mt-en-bn',
      gu: 'Helsinki-NLP/opus-mt-en-gu'
    };

    const model = modelMap[targetLang];
    if (!model) {
      return res.status(400).json({ error: 'Unsupported target language' });
    }

    // Call Hugging Face API
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${HF_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    let translated;
    if (Array.isArray(response.data) && response.data[0]?.translation_text) {
      translated = response.data[0].translation_text;
    } else if (response.data.error) {
      throw new Error(response.data.error);
    } else {
      translated = "No translation found";
    }

    res.json({ translatedText: translated });

  } catch (error) {
    console.error('Translation error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Translation failed', details: error.message });
  }
});

module.exports = router;
