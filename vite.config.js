import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

function syncPlugin() {
  let auctionState = null;
  let lastUpdate = 0;

  return {
    name: 'revibe-sync-plugin',
    configureServer(server) {
      server.middlewares.use('/api/sync', (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control');

        if (req.method === 'OPTIONS') {
          res.writeHead(200);
          res.end();
          return;
        }

        if (req.method === 'POST' || req.method === 'PUT') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              auctionState = JSON.parse(body);
              lastUpdate = Date.now();
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, timestamp: lastUpdate }));
            } catch (err) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
          });
          return;
        }

        if (req.method === 'GET') {
          res.writeHead(200, { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache' 
          });
          res.end(JSON.stringify({ data: auctionState, timestamp: lastUpdate }));
          return;
        }

        if (req.method === 'DELETE') {
          auctionState = null;
          lastUpdate = Date.now();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: 'Reset to zero' }));
          return;
        }

        res.writeHead(405);
        res.end('Method Not Allowed');
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), syncPlugin()],
})

