// Serverless sync handler for Revibe Auction
// Runs on Vercel at /api/sync and handles cross-device real-time state sharing

let auctionState = null;
let lastUpdate = 0;

export default async function handler(req, res) {
  // CORS headers for all origins and devices
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Cache-Control'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      auctionState = body;
      lastUpdate = Date.now();
      return res.status(200).json({ success: true, timestamp: lastUpdate });
    } catch (err) {
      return res.status(400).json({ error: 'Invalid JSON' });
    }
  }

  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return res.status(200).json({ 
      data: auctionState, 
      timestamp: lastUpdate 
    });
  }

  if (req.method === 'DELETE') {
    auctionState = null;
    lastUpdate = Date.now();
    return res.status(200).json({ success: true, message: 'Reset to zero' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
