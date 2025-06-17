// trusted-beacon-backend.js
// Trusted Ad Beacon API with Impression- & Session-Endpunkte

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');
const { JsonRpcProvider, Wallet, Contract } = require('ethers');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// In-memory Storage
const impressions = [];
const sessions = [];

// SHA256 Hash-Funktion
function computeHash(data) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(data))
    .digest('hex');
}

// Ethers Setup (optional, je nach Credentials)
const beaconAbi = [
  "event ImpressionLogged(address indexed reporter, tuple(string slotId, string campaignId, string creativeId, string pageUrl, uint256 viewportShare, uint256 timeInView, bool userInteraction, uint256 clickCount, uint256 hoverDuration, uint256 timestamp, bytes32 hash) data)",
  "function logImpression(tuple(string slotId, string campaignId, string creativeId, string pageUrl, uint256 viewportShare, uint256 timeInView, bool userInteraction, uint256 clickCount, uint256 hoverDuration, uint256 timestamp, bytes32 hash)) external",
  "event SessionLogged(address indexed reporter, tuple(string slotId, string campaignId, string creativeId, string pageUrl, uint256 sessionDuration, uint256 totalClicks, uint256 totalHoverTime, uint256 timestamp) data)",
  "function logSession(tuple(string slotId, string campaignId, string creativeId, string pageUrl, uint256 sessionDuration, uint256 totalClicks, uint256 totalHoverTime, uint256 timestamp)) external"
];
let beaconContract = null;
if (process.env.PRIVATE_KEY && process.env.RPC_URL && process.env.CONTRACT_ADDRESS && !process.env.PRIVATE_KEY.startsWith('0x0000')) {
  try {
    const provider = new JsonRpcProvider(process.env.RPC_URL);
    const wallet = new Wallet(process.env.PRIVATE_KEY, provider);
    beaconContract = new Contract(process.env.CONTRACT_ADDRESS, beaconAbi, wallet);
    console.log('🔗 On-chain logging initialized');
  } catch (err) {
    console.warn('⚠️ On-chain setup skipped:', err.message);
  }
} else {
  console.log('⚙️ On-chain logging disabled (no valid credentials)');
}

// POST /impression
app.post('/impression', (req, res) => {
  const payload = req.body;
  // Hash verifizieren
  const toHash = { ...payload };
  delete toHash.hash;
  const expected = computeHash(toHash);
  if (expected !== payload.hash) {
    return res.status(400).json({ error: 'Hash mismatch' });
  }
  impressions.push({ ...toHash, hash: payload.hash, verified: true });
  res.json({ status: 'ok', hash: payload.hash });
  // Optional on-chain
  if (beaconContract) {
    beaconContract.logImpression({
      slotId: payload.slotId,
      campaignId: payload.campaignId,
      creativeId: payload.creativeId || '',
      pageUrl: payload.pageUrl,
      viewportShare: payload.viewportShare,
      timeInView: payload.timeInView,
      userInteraction: payload.userInteraction,
      clickCount: payload.clickCount,
      hoverDuration: payload.hoverDuration,
      timestamp: Math.floor(new Date(payload.timestamp).getTime()),
      hash: '0x' + payload.hash
    }).catch(err => console.error('On-chain error Impression', err));
  }
});

// GET /impressions
app.get('/impressions', (req, res) => {
  res.json(impressions);
});

// POST /session
app.post('/session', (req, res) => {
  const payload = req.body;
  sessions.push(payload);
  res.json({ status: 'ok' });
  if (beaconContract) {
    beaconContract.logSession({
      slotId: payload.slotId,
      campaignId: payload.campaignId,
      creativeId: payload.creativeId || '',
      pageUrl: payload.pageUrl,
      sessionDuration: payload.sessionDuration,
      totalClicks: payload.totalClicks,
      totalHoverTime: payload.totalHoverTime,
      timestamp: Math.floor(new Date(payload.timestamp).getTime())
    }).catch(err => console.error('On-chain error Session', err));
  }
});

// GET /session
app.get('/session', (req, res) => {
  res.json(sessions);
});

// Audit-Endpoint
app.get('/audit/:hash', (req, res) => {
  const found = impressions.find(i => i.hash === req.params.hash);
  res.json(found ? { valid: true, txHash: '0xMOCK_TX' } : { valid: false });
});

// Server starten
app.listen(port, () => {
  console.log(`Trusted Beacon Backend running at http://localhost:${port}`);
});
