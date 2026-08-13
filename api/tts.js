const https = require('https');

module.exports = async (req, res) => {
  const { text, lang = 'vi' } = req.query;
  if (!text) {
    return res.status(400).json({ error: 'Text parameter is required' });
  }

  // Google Translate TTS URL
  const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(text)}`;

  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36',
      'Referer': 'https://translate.google.com/'
    }
  };

  https.get(ttsUrl, options, (apiRes) => {
    if (apiRes.statusCode !== 200) {
      return res.status(apiRes.statusCode).end();
    }
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    apiRes.pipe(res);
  }).on('error', (err) => {
    console.error('TTS proxy error:', err);
    res.status(500).json({ error: 'Failed to fetch TTS' });
  });
};
