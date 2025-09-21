const elements = {
  settingsSection: document.getElementById('settingsSection'),
  settingsForm: document.getElementById('settingsForm'),
  settingsStatus: document.getElementById('settingsStatus'),
  lastSync: document.getElementById('lastSync'),
  syncButton: document.getElementById('syncButton'),
  syncLimit: document.getElementById('syncLimit'),
  productsBody: document.getElementById('productsBody'),
  productSearch: document.getElementById('productSearch'),
  refreshProducts: document.getElementById('refreshProducts'),
  toast: document.getElementById('toast'),
};

const state = {
  settings: null,
  products: [],
};

let toastTimeout;

function debounce(fn, wait = 350) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(null, args), wait);
  };
}

async function request(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (error) {
      data = text;
    }
  }
  if (!response.ok) {
    const message = data && data.error ? data.error : response.statusText;
    throw new Error(message || 'İstek başarısız oldu');
  }
  return data;
}

function showToast(message, type = 'info') {
  if (!elements.toast) return;
  elements.toast.textContent = message;
  elements.toast.classList.remove('hidden', 'success', 'error', 'warning');
  if (type !== 'info') {
    elements.toast.classList.add(type);
  }
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }
  toastTimeout = setTimeout(() => {
    elements.toast.classList.add('hidden');
    elements.toast.classList.remove('success', 'error', 'warning');
  }, 3200);
}

function formatDateTime(value) {
  if (!value) return '—';
  try {
    const date = new Date(value);
    return new Intl.DateTimeFormat('tr-TR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  } catch (error) {
    return value;
  }
}

function fillSettingsForm(settings) {
  if (!settings || !elements.settingsForm) return;
  const fields = ['trendyol_supplier_id', 'trendyol_api_key', 'trendyol_api_secret', 'woo_store_url', 'woo_consumer_key', 'woo_consumer_secret', 'currency', 'price_sync_strategy'];
  fields.forEach((field) => {
    const input = elements.settingsForm.querySelector(`[name="${field}"]`);
    if (input) {
      input.value = settings[field] ?? '';
    }
  });
  const autoPublish = elements.settingsForm.querySelector('#auto_publish');
  if (autoPublish) {
    autoPublish.checked = Boolean(settings.auto_publish);
  }
  if (elements.lastSync) {
    elements.lastSync.textContent = `Son senkronizasyon: ${formatDateTime(settings.last_sync_at)}`;
  }
  elements.settingsSection.classList.remove('hidden');
}

async function loadSettings() {
  try {
    const settings = await request('/api/settings');
    state.settings = settings;
    fillSettingsForm(settings);
  } catch (error) {
    showToast(`Ayarlar yüklenemedi: ${error.message}`, 'error');
  }
}

function formatCurrency(value, currency = 'TRY') {
  if (typeof value === 'undefined' || value === null || Number.isNaN(Number(value))) {
    return '—';
  }
  try {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(Number(value));
  } catch (error) {
    return `${Number(value).toFixed(2)} ${currency}`;
  }
}

function getStatusBadge(status) {
  if (!status) {
    return '<span class="badge info">Bilinmiyor</span>';
  }
  const normalized = status.toLowerCase();
  if (normalized.includes('active') || normalized.includes('onay')) {
    return `<span class="badge">${status}</span>`;
  }
  if (normalized.includes('passive') || normalized.includes('sil')) {
    return `<span class="badge error">${status}</span>`;
  }
  if (normalized.includes('await') || normalized.includes('bekle')) {
    return `<span class="badge warning">${status}</span>`;
  }
  return `<span class="badge info">${status}</span>`;
}

function createProductRow(product) {
  const tr = document.createElement('tr');
  const image = Array.isArray(product.image_urls) && product.image_urls.length > 0 ? product.image_urls[0] : null;
  const source = product.source ? product.source.toUpperCase() : '—';
  const sku = product.sku || '—';
  const stock = Number.isFinite(Number(product.stock)) ? Number(product.stock) : '—';
  const price = formatCurrency(product.price, product.currency || 'TRY');
  const badge = getStatusBadge(product.status);
  const title = product.title || 'İsimsiz ürün';
  const brand = product.brand || '';

  tr.innerHTML = `
    <td>
      <div class="product-cell">
        ${
          image
            ? `<img class="product-thumb" src="${image}" alt="${title}" loading="lazy" />`
            : '<div class="product-thumb placeholder">IMG</div>'
        }
        <div>
          <p class="product-title">${title}</p>
          <p class="product-meta">${brand || 'Marka belirtilmedi'}</p>
        </div>
      </div>
    </td>
    <td>${sku}</td>
    <td>${stock}</td>
    <td>${price}</td>
    <td><span class="badge info">${source}</span></td>
    <td>${badge}</td>
  `;

  return tr;
}

function renderProducts(products) {
  if (!elements.productsBody) return;
  elements.productsBody.innerHTML = '';
  if (!products || products.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="6" class="empty">Gösterilecek ürün bulunamadı.</td>';
    elements.productsBody.appendChild(tr);
    return;
  }
  products.forEach((product) => {
    const row = createProductRow(product);
    elements.productsBody.appendChild(row);
  });
}

async function loadProducts(searchTerm = '') {
  if (elements.productsBody) {
    elements.productsBody.innerHTML = '<tr><td colspan="6" class="empty">Ürünler yükleniyor...</td></tr>';
  }
  try {
    const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
    const data = await request(`/api/products${query}`);
    state.products = data.items || [];
    renderProducts(state.products);
  } catch (error) {
    if (elements.productsBody) {
      elements.productsBody.innerHTML = `<tr><td colspan="6" class="empty">Ürünler yüklenemedi: ${error.message}</td></tr>`;
    }
  }
}

async function handleSettingsSubmit(event) {
  event.preventDefault();
  if (!elements.settingsForm) return;
  const formData = new FormData(elements.settingsForm);
  const payload = Object.fromEntries(formData.entries());
  payload.auto_publish = elements.settingsForm.querySelector('#auto_publish')?.checked || false;
  elements.settingsStatus.textContent = 'Kaydediliyor...';
  try {
    const updated = await request('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    state.settings = updated;
    elements.settingsStatus.textContent = 'Kaydedildi';
    showToast('Ayarlar başarıyla güncellendi.', 'success');
  } catch (error) {
    elements.settingsStatus.textContent = 'Hata oluştu';
    showToast(`Ayarlar kaydedilemedi: ${error.message}`, 'error');
  } finally {
    setTimeout(() => {
      elements.settingsStatus.textContent = '';
    }, 2000);
  }
}

async function handleSync() {
  if (!elements.syncButton) return;
  const limit = Number(elements.syncLimit?.value || 20);
  elements.syncButton.disabled = true;
  const originalText = elements.syncButton.textContent;
  elements.syncButton.textContent = 'Senkronize ediliyor...';
  try {
    const result = await request('/api/products/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ limit }),
    });
    await loadProducts(elements.productSearch?.value || '');
    const type = result.failed > 0 ? (result.success > 0 ? 'warning' : 'error') : 'success';
    showToast(
      `Senkronizasyon tamamlandı. Başarılı: ${result.success}, Hatalı: ${result.failed}.`,
      type
    );
    if (elements.lastSync) {
      const now = new Date().toISOString();
      elements.lastSync.textContent = `Son senkronizasyon: ${formatDateTime(now)}`;
    }
  } catch (error) {
    showToast(`Senkronizasyon sırasında hata: ${error.message}`, 'error');
  } finally {
    elements.syncButton.disabled = false;
    elements.syncButton.textContent = originalText;
  }
}

function initMenuNavigation() {
  const buttons = document.querySelectorAll('.menu-item');
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      buttons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
      const targetId = button.dataset.target;
      const targetEl = document.getElementById(`${targetId}Section`) || document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

function initEventListeners() {
  if (elements.settingsForm) {
    elements.settingsForm.addEventListener('submit', handleSettingsSubmit);
  }
  if (elements.syncButton) {
    elements.syncButton.addEventListener('click', handleSync);
  }
  if (elements.refreshProducts) {
    elements.refreshProducts.addEventListener('click', (event) => {
      event.preventDefault();
      loadProducts(elements.productSearch?.value || '');
    });
  }
  if (elements.productSearch) {
    const debounced = debounce((value) => loadProducts(value), 400);
    elements.productSearch.addEventListener('input', (event) => {
      debounced(event.target.value);
    });
  }
}

async function bootstrap() {
  initMenuNavigation();
  initEventListeners();
  await Promise.all([loadSettings(), loadProducts()]);
}

bootstrap();
