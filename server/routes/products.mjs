import { supabaseService } from '../lib/supabase.mjs';
import { sendError, sendJson } from '../lib/response.mjs';
import { parseJson } from '../lib/request.mjs';
import { logger } from '../lib/logger.mjs';
import { syncTrendyolToWoo } from '../services/productSync.mjs';

export async function listProducts(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const search = url.searchParams.get('search') || undefined;
    const products = await supabaseService.fetchProducts({ search });
    sendJson(res, 200, { items: products });
  } catch (error) {
    logger.error('Ürünler listelenirken hata', error.message);
    sendError(res, 500, 'Ürünler yüklenemedi', error.message);
  }
}

export async function syncProducts(req, res) {
  try {
    const payload = await parseJson(req, res);
    const limit = payload?.limit && Number.isFinite(Number(payload.limit)) ? Number(payload.limit) : 20;
    const result = await syncTrendyolToWoo({ limit });
    sendJson(res, 200, result);
  } catch (error) {
    logger.error('Ürün senkronizasyonu başarısız', error.message);
    if (!res.headersSent) {
      sendError(res, 500, 'Ürünler senkronize edilemedi', error.message);
    }
  }
}
