const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
for (const file of ['.env', '.env.local']) {
  const location = path.join(root, file);
  if (fs.existsSync(location) && process.loadEnvFile) process.loadEnvFile(location);
}
const handlers = { '/api/enquiry': require('../api/enquiry'), '/api/weather': require('../api/weather') };
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (handlers[url.pathname]) {
    req.query = Object.fromEntries(url.searchParams);
    res.status = code => { res.statusCode = code; return res; };
    res.json = body => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(body)); };
    try {
      let raw = '';
      for await (const chunk of req) { raw += chunk; if (Buffer.byteLength(raw) > 10000) { res.status(413).json({error:'Request too large'}); return; } }
      req.body = raw ? JSON.parse(raw) : {};
      await handlers[url.pathname](req, res);
    } catch { if (!res.writableEnded) res.status(400).json({error:'Invalid request'}); }
    return;
  }
  let filename;
  try { filename = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname); } catch { res.writeHead(400); res.end(); return; }
  const file = path.resolve(root, '.' + filename);
  const allowed = file.startsWith(root + path.sep) && !filename.split('/').some(part => part.startsWith('.')) && !/^\/(api|scripts|node_modules)\//.test(filename) && types[path.extname(file)];
  if (!allowed || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end('Not found'); return; }
  res.setHeader('Content-Type', types[path.extname(file)]);
  fs.createReadStream(file).pipe(res);
});
server.listen(Number(process.env.PORT || 3000), '127.0.0.1', () => console.log(`Preview: http://localhost:${server.address().port}`));
