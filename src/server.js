const http = require('http'); const path = require('path'); const { createApp, FREE_LIMIT } = require('./app');
const { handler } = createApp({
  dataFile: process.env.PW_DATA || path.join(__dirname, '..', 'data', 'db.json'),
  adminPassword: process.env.PW_ADMIN_PASSWORD || (() => { throw new Error('Set PW_ADMIN_PASSWORD'); })() });
const port = process.env.PORT || 3000;
http.createServer(handler).listen(port, () => console.log(`ProofWall Free on :${port} (1 wall, up to ${FREE_LIMIT} testimonials, "Powered by ProofWall" badge)`));
