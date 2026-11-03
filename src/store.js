// Tiny JSON-file store. Zero dependencies; atomic write via rename.
const fs = require('fs'); const path = require('path'); const crypto = require('crypto');
class Store {
  constructor(file) { this.file = file; this.data = { testimonials: [] };
    if (fs.existsSync(file)) this.data = JSON.parse(fs.readFileSync(file, 'utf8')); }
  save() { fs.mkdirSync(path.dirname(this.file), { recursive: true });
    const tmp = this.file + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(this.data, null, 2)); fs.renameSync(tmp, this.file); }
  add(input) {
    const name = String(input.name || '').trim().slice(0, 80);
    const text = String(input.text || '').trim().slice(0, 2000);
    const rating = Math.round(Number(input.rating));
    if (!name) throw new Error('name required');
    if (text.length < 10) throw new Error('testimonial too short');
    if (!(rating >= 1 && rating <= 5)) throw new Error('rating must be 1-5');
    const t = { id: crypto.randomUUID(), name, text, rating,
      role: String(input.role || '').trim().slice(0, 80), status: 'pending', createdAt: new Date().toISOString() };
    this.data.testimonials.push(t); this.save(); return t;
  }
  setStatus(id, status) {
    if (!['approved', 'rejected', 'pending'].includes(status)) throw new Error('bad status');
    const t = this.data.testimonials.find(x => x.id === id); if (!t) throw new Error('not found');
    t.status = status; this.save(); return t;
  }
  list(status) { return this.data.testimonials.filter(t => !status || t.status === status)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }
}
module.exports = { Store };
