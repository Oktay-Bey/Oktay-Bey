import { supabaseService } from '../lib/supabase.mjs';
import { logger } from '../lib/logger.mjs';
import { fetchTrendyolProducts } from './trendyol.mjs';
import { pushProductToWooCommerce } from './woocommerce.mjs';

function ensureSettings(settings) {
  if (!settings) {
    throw new Error('Entegrasyon ayarları bulunamadı.');
  }
  const required = {
    trendyol_supplier_id: 'Trendyol Tedarikçi Numarası',
    trendyol_api_key: 'Trendyol API Anahtarı',
    trendyol_api_secret: 'Trendyol API Gizli Anahtarı',
    woo_store_url: 'WooCommerce Mağaza URL',
    woo_consumer_key: 'WooCommerce Consumer Key',
    woo_consumer_secret: 'WooCommerce Consumer Secret',
  };

  Object.entries(required).forEach(([key, label]) => {
    if (!settings[key]) {
      throw new Error(`${label} ayarlardan tanımlanmalıdır.`);
    }
  });
}

export async function syncTrendyolToWoo({ limit = 20 } = {}) {
  const settings = await supabaseService.fetchSettings();
  ensureSettings(settings);

  const trendyolResponse = await fetchTrendyolProducts({
    supplierId: settings.trendyol_supplier_id,
    apiKey: settings.trendyol_api_key,
    apiSecret: settings.trendyol_api_secret,
    size: limit,
  });

  const products = trendyolResponse.items;
  if (!Array.isArray(products) || products.length === 0) {
    logger.warn('Trendyol üzerinden ürün bulunamadı.');
    return {
      total: 0,
      success: 0,
      failed: 0,
      results: [],
    };
  }

  await supabaseService.upsertProducts(products);

  const syncResults = [];
  let successCount = 0;
  let failedCount = 0;

  for (const product of products) {
    try {
      await pushProductToWooCommerce({
        storeUrl: settings.woo_store_url,
        consumerKey: settings.woo_consumer_key,
        consumerSecret: settings.woo_consumer_secret,
        product,
        options: {
          autoPublish: settings.auto_publish,
        },
      });
      successCount += 1;
      syncResults.push({
        productId: product.external_id,
        status: 'success',
      });
    } catch (error) {
      failedCount += 1;
      logger.error('WooCommerce aktarım hatası', {
        productId: product.external_id,
        message: error.message,
      });
      syncResults.push({
        productId: product.external_id,
        status: 'failed',
        message: error.message,
      });
    }
  }

  const status = failedCount === 0 ? 'success' : successCount === 0 ? 'failed' : 'partial';

  await supabaseService.recordSyncLog({
    status,
    message: `Trendyol'dan ${products.length} ürün alındı. ${successCount} WooCommerce'e aktarıldı`,
    source: 'trendyol',
    target: 'woocommerce',
    synced_count: successCount,
    failed_count: failedCount,
    details: syncResults,
  });

  await supabaseService.upsertSettings({
    ...settings,
    last_sync_at: new Date().toISOString(),
  });

  return {
    total: products.length,
    success: successCount,
    failed: failedCount,
    results: syncResults,
  };
}
