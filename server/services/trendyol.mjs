import { logger } from '../lib/logger.mjs';

function buildAuthHeader(apiKey, apiSecret) {
  const token = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
  return `Basic ${token}`;
}

function mapProduct(item) {
  const productId = item.id || item.productId || item.itemId;
  const images = Array.isArray(item.images)
    ? item.images.map((image) => (typeof image === 'string' ? image : image.url)).filter(Boolean)
    : [];
  const attributes = Array.isArray(item.attributes)
    ? item.attributes
    : item.attributeList || [];

  return {
    external_id: productId ? String(productId) : undefined,
    source: 'trendyol',
    title: item.title || item.productName || item.name || 'Ürün',
    sku: item.stockCode || item.sku || item.barcode || '',
    barcode: item.barcode || '',
    stock: Number(item.quantity || item.stock || 0),
    price: Number(item.salePrice || item.listPrice || item.price || 0),
    currency: item.currency || 'TRY',
    brand: item.brand?.name || item.brand || '',
    category: item.categoryName || item.category?.name || '',
    status: item.approvalStatus || item.status || 'ACTIVE',
    attributes,
    image_urls: images,
    raw_payload: item,
    last_synced_at: new Date().toISOString(),
  };
}

export async function fetchTrendyolProducts({
  supplierId,
  apiKey,
  apiSecret,
  page = 0,
  size = 50,
} = {}) {
  if (!supplierId || !apiKey || !apiSecret) {
    throw new Error('Trendyol entegrasyonu için tedarikçi numarası ve API kimlik bilgileri gereklidir.');
  }

  const url = new URL(`https://api.trendyol.com/sapigw/suppliers/${supplierId}/products`);
  url.searchParams.set('page', page);
  url.searchParams.set('size', size);

  logger.info('Trendyol ürünleri çekiliyor', {
    supplierId,
    page,
    size,
  });

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: buildAuthHeader(apiKey, apiSecret),
      'User-Agent': 'IntegrationPanel/1.0',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Trendyol API isteği başarısız (${response.status}): ${text}`);
  }

  const data = await response.json();
  const items = Array.isArray(data.content) ? data.content : data.items || [];
  const products = items.map(mapProduct).filter((item) => Boolean(item.external_id));

  return {
    totalElements: data.totalElements || products.length,
    pageCount: data.pageCount || 1,
    items: products,
    raw: data,
  };
}
