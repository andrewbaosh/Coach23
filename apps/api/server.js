import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { runDailyReview } from '../../jobs/daily-review/index.js';
import { MemoryAthleteRepository } from '../../packages/athlete-db/index.js';
import { PROVIDERS } from '../../packages/shared/index.js';
export function createApp() {
  const repository = new MemoryAthleteRepository();
  return createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; frame-ancestors 'none'");
    const send = (status, data) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(data)); };
    try {
      const path = new URL(req.url, 'http://localhost').pathname;
      if (req.method === 'GET' && path === '/api/health') return send(200, { status: 'ok', mode: 'demo' });
      if (req.method === 'GET' && path === '/api/integrations') return send(200, PROVIDERS.map(provider => ({ provider, connected: false, mode: 'demo', liveImplemented: false })));
      if (req.method === 'GET' && path === '/api/demo/review') return send(200, await runDailyReview({ repository }));
      const assets = { '/': ['index.html', 'text/html'], '/app.js': ['app.js', 'text/javascript'], '/style.css': ['style.css', 'text/css'] };
      if (req.method === 'GET' && assets[path]) {
        const [file, type] = assets[path];
        const content = await readFile(new URL(`../web/${file}`, import.meta.url));
        res.writeHead(200, { 'Content-Type': `${type}; charset=utf-8` }); return res.end(content);
      }
      send(404, { error: 'Not found' });
    } catch { send(500, { error: 'Review failed' }); }
  });
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT || 3023);
  createApp().listen(port, '127.0.0.1', () => console.log(`Coach23 demo: http://127.0.0.1:${port}`));
}
