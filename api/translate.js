const express = require('express');
const axios = require('axios');
const router = express.Router();

// ⛔ Never hardcode in production — use environment variable in Vercel
const HF_API_TOKEN = process.env.HF_API_TOKEN || 'hf_xxxxxxx'; 

router.options('/', (req, res) => {
  // ✅ Preflight CORS handling
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return res.status(200).end();
});

router.post('/', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { text, targetLang } = req.body;

  if (!text || !targetLang) {
    return res.status(400).json({ error: "Missing 'text' or 'targetLang' in request body" });
  }

  try {
    // ✅ Map targetLang to Hugging Face model name
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

    // ✅ Call Hugging Face Translation API
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

    // ✅ Extract translation
    const translated = response.data?.[0]?.translation_text || "No translation found";

    res.json({ translatedText: translated });

  } catch (error) {
    console.error('Translation error:', error.message);
    res.status(500).json({ error: 'Translation failed' });
  }
});

module.exports = router;
