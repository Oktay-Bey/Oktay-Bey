import { createReadStream, statSync } from 'node:fs';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { sendError } from './response.mjs';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

function getFilePath(publicDir, urlPath) {
  const safeSuffix = path.normalize(urlPath).replace(/^\\+|^\/+/, '');
  let filePath = path.join(publicDir, safeSuffix);
  if (filePath.endsWith(path.sep)) {
    filePath = path.join(filePath, 'index.html');
  }
  return filePath;
}

export async function serveStatic(req, res, publicDir) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const filePath = getFilePath(publicDir, url.pathname === '/' ? '/index.html' : url.pathname);

  if (!existsSync(filePath)) {
    if (!url.pathname.includes('.')) {
      const fallback = path.join(publicDir, 'index.html');
      if (existsSync(fallback)) {
        const stream = createReadStream(fallback);
        res.writeHead(200, { 'Content-Type': MIME_TYPES['.html'] });
        stream.pipe(res);
        return;
      }
    }
    sendError(res, 404, 'İçerik bulunamadı');
    return;
  }

  const stats = statSync(filePath);
  if (stats.isDirectory()) {
    sendError(res, 403, 'Dizin görüntülenemez');
    return;
  }

  const extension = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[extension] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  const stream = createReadStream(filePath);
  stream.pipe(res);
}
