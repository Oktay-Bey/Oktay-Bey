import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv, getEnv } from './lib/env.mjs';
import { router } from './routes/index.mjs';
import { serveStatic } from './lib/static.mjs';
import { logger } from './lib/logger.mjs';

loadEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');
const port = Number(getEnv('PORT', 3000));

const server = http.createServer(async (req, res) => {
  try {
    if (req.url.startsWith('/api/')) {
      await router(req, res);
      return;
    }
    await serveStatic(req, res, publicDir);
  } catch (error) {
    logger.error('Sunucu isteği işlenirken hata oluştu', {
      message: error.message,
      stack: error.stack,
    });
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Beklenmeyen bir hata oluştu' }));
    } else {
      res.end();
    }
  }
});

server.listen(port, () => {
  logger.info(`E-ticaret entegrasyon paneli http://localhost:${port} adresinde çalışıyor.`);
});

function gracefulShutdown() {
  logger.info('Sunucu kapatılıyor...');
  server.close(() => {
    logger.info('Sunucu kapatıldı.');
    process.exit(0);
  });
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
