import { supabaseService } from '../lib/supabase.mjs';
import { sendError, sendJson } from '../lib/response.mjs';
import { parseJson } from '../lib/request.mjs';
import { logger } from '../lib/logger.mjs';

export async function getSettings(req, res) {
  try {
    const settings = await supabaseService.fetchSettings();
    sendJson(res, 200, settings);
  } catch (error) {
    logger.error('Ayarlar yüklenirken hata oluştu', error.message);
    sendError(res, 500, 'Ayarlar yüklenemedi', error.message);
  }
}

export async function updateSettings(req, res) {
  try {
    const payload = await parseJson(req, res);
    const updated = await supabaseService.upsertSettings(payload);
    sendJson(res, 200, updated);
  } catch (error) {
    logger.error('Ayarlar güncellenirken hata', error.message);
    if (!res.headersSent) {
      sendError(res, 500, 'Ayarlar güncellenemedi', error.message);
    }
  }
}
