const fs = require('fs'); const path = require('path'); const crypto = require('crypto');
const { Store } = require('./store');
const FREE_LIMIT = 15; // free tier: 1 wall, up to 15 active (pending + approved) testimonials
const PUB = path.join(__dirname, '..', 'public');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#39;' }[c]));
function createApp({ dataFile, adminPassword, limit = FREE_LIMIT }) {
  const store = new Store(dataFile);
  const hits = new Map(); // naive rate limit for public submit
  const json = (res, code, obj) => { res.writeHead(code, { 'content-type': 'application/json', 'access-control-allow-origin': '*' }); res.end(JSON.stringify(obj)); };
  const body = req => new Promise((ok, bad) => { let b = ''; req.on('data', c => { b += c; if (b.length > 1e5) req.destroy(); });
    req.on('end', () => { try { ok(req.headers['content-type']?.includes('json') ? JSON.parse(b || '{}') : Object.fromEntries(new URLSearchParams(b))); } catch (e) { bad(e); } }); });
  const authed = req => { const h = req.headers.authorization || ''; const pw = Buffer.from(h.replace(/^Basic /, ''), 'base64').toString().split(':').slice(1).join(':');
    const a = Buffer.from(pw), b = Buffer.from(adminPassword); return a.length === b.length && crypto.timingSafeEqual(a, b); };
  const file = (res, f, type) => { res.writeHead(200, { 'content-type': type, 'access-control-allow-origin': '*' }); res.end(fs.readFileSync(path.join(PUB, f))); };
  async function handler(req, res) {
    const url = new URL(req.url, 'http://x'); const p = url.pathname;
    try {
      if (req.method === 'OPTIONS') { res.writeHead(204, { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type' }); return res.end(); }
      if (p === '/' || p === '/collect') return file(res, 'collect.html', 'text/html; charset=utf-8');
      if (p === '/widget.js') return file(res, 'widget.js', 'application/javascript; charset=utf-8');
      if (p === '/api/testimonials' && req.method === 'POST') {
        const ip = req.socket.remoteAddress; const n = (hits.get(ip) || 0) + 1; hits.set(ip, n);
        if (n > 20) return json(res, 429, { error: 'too many submissions' });
        const b = await body(req); if (b.website) return json(res, 200, { ok: true }); // honeypot
        if (store.list().filter(x => x.status !== 'rejected').length >= limit) return json(res, 403, { error: `ProofWall Free holds up to ${limit} testimonials. Reject some in admin or upgrade to Solo/Agency.` });
        const t = store.add(b); return json(res, 201, { ok: true, id: t.id });
      }
      if (p === '/api/wall' && req.method === 'GET')
        return json(res, 200, { branding: true, items: store.list('approved').slice(0, limit).map(({ id, name, role, text, rating }) => ({ id, name, role, text, rating })) });
      if (p.startsWith('/admin') || p.startsWith('/api/admin')) {
        if (!authed(req)) { res.writeHead(401, { 'www-authenticate': 'Basic realm="ProofWall admin"' }); return res.end('auth required'); }
        if (p === '/admin') return file(res, 'admin.html', 'text/html; charset=utf-8');
        if (p === '/api/admin/testimonials') return json(res, 200, { licensed: false, edition: 'free', limit, items: store.list() });
        const m = p.match(/^\/api\/admin\/testimonials\/([\w-]+)$/);
        if (m && req.method === 'POST') { const b = await body(req); return json(res, 200, store.setStatus(m[1], b.status)); }
      }
      json(res, 404, { error: 'not found' });
    } catch (e) { json(res, 400, { error: esc(e.message) }); }
  }
  return { handler, store, limit };
}
module.exports = { createApp, esc, FREE_LIMIT };
