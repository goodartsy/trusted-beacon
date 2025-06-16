// trusted-beacon-backend.js
// Trusted Ad Beacon - API Prototype (Express.js) with Full Hash Verification and Debug Logging

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

const impressions = [];

// Utility to compute SHA-256 hash synchronously
function computeHash(data) {
  return crypto.createHash('sha256')
    .update(JSON.stringify(data))
    .digest('hex');
}

// POST /impression - register a new ad impression
app.post('/impression', (req, res) => {
  // 1) Log the entire payload received
  console.log('\n📥 Impression payload:', req.body);

  const {
    slotId,
    campaignId,
    creativeId,
    pageUrl,
    viewportShare,
    timeInView,
    userInteraction,
    clickCount,
    hoverDuration,
    userAgent,
    timestamp,
    hash: receivedHash
  } = req.body;

  // 2) Build the exact object to hash, including interaction metrics
  const payloadToHash = {
    slotId,
    campaignId,
    creativeId,
    pageUrl,
    viewportShare,
    timeInView,
    userInteraction,
    clickCount,
    hoverDuration,
    userAgent,
    timestamp
  };

  // 3) Compute expected hash
  const expectedHash = computeHash(payloadToHash);
  console.log('🔑 Received hash:', receivedHash);
  console.log('🔒 Expected hash:', expectedHash);

  // 4) Validate hash match
  if (expectedHash !== receivedHash) {
    console.warn('⚠️ Hash mismatch – rejecting request');
    return res.status(400).json({ error: 'Hash mismatch' });
  }

  // 5) Store the verified impression
  impressions.push({ ...payloadToHash, hash: receivedHash, verified: true });

  // Respond OK
  res.status(200).json({ status: 'ok', hash: receivedHash });
});

// GET /impressions - retrieve all or filter by campaignId
app.get('/impressions', (req, res) => {
  const { campaignId } = req.query;
  const result = campaignId
    ? impressions.filter(i => i.campaignId === campaignId)
    : impressions;
  res.json(result);
});

// GET /audit/:hash - audit an impression by its hash
app.get('/audit/:hash', (req, res) => {
  const found = impressions.find(i => i.hash === req.params.hash);
  if (!found) {
    return res.status(404).json({ valid: false });
  }
  res.json({
    valid: true,
    txHash: '0xMOCK_TRANSACTION_HASH',
    timestamp: found.timestamp
  });
});

// Start server
app.listen(port, () => {
  console.log(`Trusted Beacon Backend running at http://localhost:${port}`);
});
