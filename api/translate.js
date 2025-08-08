const http = require('http');
const https = require('https'); // for calling huggingface API
const { URL } = require('url');

const HF_API_TOKEN = process.env.HF_API_TOKEN;
if (!HF_API_TOKEN) {
  throw new Error("❌ Missing Hugging Face API token");
}

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    // Respond OK to preflight requests
    res.writeHead(200);
    return res.end();
  }

  if (req.method === 'POST' && req.url === '/') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      // Optional: limit max size to prevent abuse
      if (body.length > 1e6) {
        req.connection.destroy();
      }
    });
    req.on('end', () => {
      try {
        const { text, targetLang } = JSON.parse(body);
        if (!text || !targetLang) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: "Missing 'text' or 'targetLang' in request body" }));
        }

        const modelMap = {
          hi: 'Helsinki-NLP/opus-mt-en-hi',
          mr: 'Helsinki-NLP/opus-mt-en-mr',
          bn: 'Helsinki-NLP/opus-mt-en-bn',
          gu: 'Helsinki-NLP/opus-mt-en-gu'
        };

        const model = modelMap[targetLang];
        if (!model) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Unsupported target language' }));
        }

        // Prepare Hugging Face API request options
        const postData = JSON.stringify({ inputs: text });
        const options = new URL(`https://api-inference.huggingface.co/models/${model}`);

        const requestOptions = {
          hostname: options.hostname,
          path: options.pathname,
          method: 'POST',
          headers: {
            Authorization: `Bearer ${HF_API_TOKEN}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          }
        };

        const apiReq = https.request(requestOptions, apiRes => {
          let apiData = '';
          apiRes.on('data', chunk => {
            apiData += chunk;
          });
          apiRes.on('end', () => {
            try {
              const parsed = JSON.parse(apiData);
              let translated;
              if (Array.isArray(parsed) && parsed[0]?.translation_text) {
                translated = parsed[0].translation_text;
              } else if (parsed.error) {
                throw new Error(parsed.error);
              } else {
                translated = "No translation found";
              }
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ translatedText: translated }));
            } catch (err) {
              console.error('API response parsing error:', err.message);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Translation failed', details: err.message }));
            }
          });
        });

        apiReq.on('error', (e) => {
          console.error('Request error:', e.message);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Translation failed', details: e.message }));
        });

        apiReq.write(postData);
        apiReq.end();

      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
