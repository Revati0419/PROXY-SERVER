const express = require('express');
const axios = require('axios');

const router = express.Router();

const HF_API_TOKEN = process.env.HF_API_TOKEN;
if (!HF_API_TOKEN) {
  throw new Error("❌ Missing Hugging Face API token");
}

router.post('/', async (req, res) => {
  const { text, targetLang } = req.body || {};

  if (!text || !targetLang) {
    return res.status(400).json({ error: "Missing 'text' or 'targetLang' in request body" });
  }

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

  try {
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

    if (Array.isArray(response.data) && response.data[0]?.translation_text) {
      return res.json({ translatedText: response.data[0].translation_text });
    } else if (response.data.error) {
      return res.status(500).json({ error: response.data.error });
    } else {
      return res.json({ translatedText: "No translation found" });
    }
  } catch (error) {
    console.error('Translation error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Translation failed', details: error.message });
  }
});

module.exports = router;
