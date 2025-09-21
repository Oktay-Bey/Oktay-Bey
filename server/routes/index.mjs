import { getSettings, updateSettings } from './settings.mjs';
import { listProducts, syncProducts } from './products.mjs';
import { sendError } from '../lib/response.mjs';

export async function router(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const { pathname } = url;

  if (req.method === 'GET' && pathname === '/api/settings') {
    await getSettings(req, res);
    return true;
  }

  if (req.method === 'PUT' && pathname === '/api/settings') {
    await updateSettings(req, res);
    return true;
  }

  if (req.method === 'GET' && pathname === '/api/products') {
    await listProducts(req, res);
    return true;
  }

  if (req.method === 'POST' && pathname === '/api/products/sync') {
    await syncProducts(req, res);
    return true;
  }

  sendError(res, 404, 'API uç noktası bulunamadı');
  return false;
}

export default router;
