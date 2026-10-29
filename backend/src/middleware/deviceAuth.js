/**
 * Device Authentication Middleware
 * Validates the API key sent by ESP32 or simulated ingestion clients.
 */
const deviceAuth = (req, res, next) => {
  const configuredApiKey = process.env.DEVICE_API_KEY;

  // If no API key is set in environment, allow all (permissive mode for local dev)
  if (!configuredApiKey || configuredApiKey.trim() === '') {
    return next();
  }

  // Extract API key from header, query param, or body
  const apiKey =
    req.headers['x-api-key'] ||
    req.headers['x-device-key'] ||
    (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null) ||
    req.query.api_key ||
    (req.body && req.body.api_key);

  if (!apiKey || apiKey !== configuredApiKey) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid or missing device API key.',
      hint: 'Include your secret key in the x-api-key HTTP header or api_key payload parameter.',
    });
  }

  next();
};

module.exports = deviceAuth;
