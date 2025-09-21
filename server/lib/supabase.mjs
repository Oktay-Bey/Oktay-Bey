import { getEnv } from './env.mjs';
import { logger } from './logger.mjs';

const SUPABASE_URL = getEnv('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY');

function ensureConfigured() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase bağlantısı için SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY tanımlanmalıdır.');
  }
}

async function supabaseRequest(path, { method = 'GET', headers = {}, body, params } = {}) {
  ensureConfigured();
  const url = new URL(`${SUPABASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (typeof value !== 'undefined' && value !== null) {
        url.searchParams.set(key, value);
      }
    });
  }

  const response = await fetch(url.toString(), {
    method,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    logger.error('Supabase isteği başarısız', {
      path: url.toString(),
      status: response.status,
      body: text,
    });
    throw new Error(`Supabase isteği başarısız oldu (${response.status}): ${text}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

function normalizeSettings(record = {}) {
  const {
    id,
    trendyol_supplier_id = '',
    trendyol_api_key = '',
    trendyol_api_secret = '',
    woo_consumer_key = '',
    woo_consumer_secret = '',
    woo_store_url = '',
    currency = 'TRY',
    price_sync_strategy = 'match',
    auto_publish = false,
    last_sync_at = null,
  } = record;

  return {
    id,
    trendyol_supplier_id,
    trendyol_api_key,
    trendyol_api_secret,
    woo_consumer_key,
    woo_consumer_secret,
    woo_store_url,
    currency,
    price_sync_strategy,
    auto_publish,
    last_sync_at,
  };
}

export class SupabaseService {
  async fetchSettings() {
    const data = await supabaseRequest('/rest/v1/integration_settings', {
      params: {
        select: '*',
        limit: 1,
      },
    });
    return normalizeSettings(data[0] || {});
  }

  async upsertSettings(payload) {
    const record = {
      id: payload.id || 1,
      trendyol_supplier_id: payload.trendyol_supplier_id || '',
      trendyol_api_key: payload.trendyol_api_key || '',
      trendyol_api_secret: payload.trendyol_api_secret || '',
      woo_consumer_key: payload.woo_consumer_key || '',
      woo_consumer_secret: payload.woo_consumer_secret || '',
      woo_store_url: payload.woo_store_url || '',
      currency: payload.currency || 'TRY',
      price_sync_strategy: payload.price_sync_strategy || 'match',
      auto_publish: Boolean(payload.auto_publish),
      last_sync_at: payload.last_sync_at || null,
      updated_at: new Date().toISOString(),
    };

    const response = await supabaseRequest('/rest/v1/integration_settings', {
      method: 'POST',
      headers: {
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: [record],
    });
    return normalizeSettings(response[0] || record);
  }

  async fetchProducts({ search } = {}) {
    const params = new URLSearchParams({ select: '*', order: 'updated_at.desc.nullslast' });
    if (search) {
      params.set('or', `title.ilike.*${search}*,sku.ilike.*${search}*`);
    }
    const data = await supabaseRequest('/rest/v1/products', {
      params,
    });
    return data;
  }

  async upsertProducts(products = []) {
    if (!Array.isArray(products) || products.length === 0) {
      return [];
    }
    const payload = products.map((product) => ({
      ...product,
      updated_at: new Date().toISOString(),
    }));
    const response = await supabaseRequest('/rest/v1/products', {
      method: 'POST',
      headers: {
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: payload,
    });
    return response;
  }

  async recordSyncLog(entry) {
    const payload = {
      status: entry.status || 'success',
      message: entry.message || '',
      source: entry.source || 'trendyol',
      target: entry.target || 'woocommerce',
      synced_count: entry.synced_count || 0,
      failed_count: entry.failed_count || 0,
      created_at: new Date().toISOString(),
      details: entry.details ? JSON.stringify(entry.details) : null,
    };

    await supabaseRequest('/rest/v1/sync_logs', {
      method: 'POST',
      headers: {
        Prefer: 'return=minimal',
      },
      body: [payload],
    });
  }
}

export const supabaseService = new SupabaseService();
