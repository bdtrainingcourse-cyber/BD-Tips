module.exports = (req, res) => {
  const webhookUrl = process.env.GOOGLE_SHEET_LEADS_WEBHOOK || '';
  const secureKey = process.env.B2B_SECRET_KEY || '';
  
  res.status(200).json({
    hasWebhook: !!webhookUrl,
    webhookLength: webhookUrl.length,
    webhookStart: webhookUrl.substring(0, 30),
    webhookEnd: webhookUrl.substring(webhookUrl.length - 15),
    hasSecureKey: !!secureKey,
    secureKeyLength: secureKey.length,
    secureKeyStart: secureKey.substring(0, 5)
  });
};
