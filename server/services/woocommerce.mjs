import { logger } from '../lib/logger.mjs';

function buildAuthHeader(consumerKey, consumerSecret) {
  const token = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  return `Basic ${token}`;
}

function mapAttributes(attributes = []) {
  return attributes
    .filter((attr) => attr && (attr.attribute || attr.name))
    .map((attr) => ({
      name: attr.attribute?.name || attr.name,
      option: attr.attribute?.value || attr.value || attr.attributeValue,
    }))
    .filter((attr) => attr.name && attr.option);
}

function toWooPayload(product, { autoPublish = false } = {}) {
  const descriptionParts = [];
  if (product.brand) {
    descriptionParts.push(`<p><strong>Marka:</strong> ${product.brand}</p>`);
  }
  if (Array.isArray(product.attributes) && product.attributes.length > 0) {
    const listItems = product.attributes
      .map((attr) => `<li>${attr.name || attr.attributeName}: ${attr.value || attr.attributeValue}</li>`)
      .join('');
    descriptionParts.push(`<ul>${listItems}</ul>`);
  }

  return {
    name: product.title,
    type: 'simple',
    regular_price: product.price ? String(product.price) : '0',
    sku: product.sku || undefined,
    manage_stock: true,
    stock_quantity: Number.isFinite(product.stock) ? Number(product.stock) : undefined,
    status: autoPublish ? 'publish' : 'draft',
    description: descriptionParts.join('\n'),
    short_description: product.category ? `Kategori: ${product.category}` : undefined,
    categories: product.category ? [{ name: product.category }] : undefined,
    images: Array.isArray(product.image_urls)
      ? product.image_urls.map((url) => ({ src: url }))
      : undefined,
    meta_data: [
      { key: 'external_source', value: product.source },
      { key: 'external_id', value: product.external_id },
    ],
    attributes: mapAttributes(product.attributes),
  };
}

export async function pushProductToWooCommerce({
  storeUrl,
  consumerKey,
  consumerSecret,
  product,
  options = {},
} = {}) {
  if (!storeUrl || !consumerKey || !consumerSecret) {
    throw new Error('WooCommerce entegrasyonu için mağaza adresi ve API kimlik bilgileri gereklidir.');
  }

  const url = new URL('/wp-json/wc/v3/products', storeUrl);
  const payload = toWooPayload(product, options);

  logger.info('WooCommerce ürün oluşturma isteği gönderiliyor', {
    endpoint: url.toString(),
    sku: product.sku,
  });

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      Authorization: buildAuthHeader(consumerKey, consumerSecret),
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`WooCommerce API isteği başarısız (${response.status}): ${text}`);
  }

  return response.json();
}
