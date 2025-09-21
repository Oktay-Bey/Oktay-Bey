# E-Ticaret Entegrasyon Yönetim Paneli

Supabase tabanlı bu panel sayesinde Trendyol'dan çekilen ürünlerinizi tek noktadan yönetebilir ve WooCommerce mağazanıza aktarabilirsiniz. Proje, offline ortamda çalışabilmesi için harici bağımlılık olmadan Node.js'in yerleşik modülleri ve vanilla JavaScript kullanılarak geliştirilmiştir.

## Özellikler

- 🔐 **Ayar Yönetimi:** Trendyol ve WooCommerce API kimlik bilgilerinizi güvenle saklayın ve güncelleyin.
- 📦 **Ürün İzleme:** Supabase üzerinde tutulan ürün kayıtlarını filtreleyip inceleyin.
- 🔄 **Tek Tıkla Senkronizasyon:** Trendyol'dan ürün çekip WooCommerce'e aktarımı başlatın.
- 🧾 **Senkronizasyon Logları:** Her aktarım sonrası Supabase üzerinde log kaydı tutarak izlenebilirlik sağlayın.
- 🖥️ **Modern Arayüz:** Masaüstü ve tabletlerde şık görünen, hızlı çalışan yönetim paneli.

## Mimari

| Katman | Teknoloji | Açıklama |
| --- | --- | --- |
| Front-end | Vanilla JS, HTML, CSS | Yönetim paneli arayüzü. |
| Back-end | Node.js (yerleşik HTTP modülü) | API uçları, Trendyol & WooCommerce entegrasyonları. |
| Veri Tabanı | Supabase | Ayarlar, ürünler ve senkronizasyon loglarının saklandığı PostgreSQL. |

```
public/            → Arayüz dosyaları
server/            → HTTP sunucusu, rotalar ve servisler
  lib/             → Yardımcı araçlar (env, logger, supabase vb.)
  routes/          → API uçları
  services/        → Trendyol, WooCommerce ve senkronizasyon servisleri
scripts/           → Yardımcı scriptler (örn. lint bildirimi)
```

## Kurulum

1. Depoyu klonlayın ve kök dizinde `.env.example` dosyasını `.env` olarak kopyalayın.

   ```bash
   cp .env.example .env
   ```

2. `.env` içerisine Supabase proje bilgilerinizi girin:

   ```ini
   PORT=3000
   SUPABASE_URL=https://<proje-ref>.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
   SUPABASE_ANON_KEY=<opsiyonel>
   ```

   > **Not:** Service Role anahtarını sadece sunucu tarafında kullanın ve gizli tutun.

3. Gerekli Supabase tablolarını oluşturun. Aşağıdaki SQL komutlarını Supabase SQL Editörüne uygulayabilirsiniz:

   ```sql
   create table if not exists integration_settings (
     id integer primary key default 1,
     trendyol_supplier_id text,
     trendyol_api_key text,
     trendyol_api_secret text,
     woo_store_url text,
     woo_consumer_key text,
     woo_consumer_secret text,
     currency text default 'TRY',
     price_sync_strategy text default 'match',
     auto_publish boolean default false,
     last_sync_at timestamptz,
     created_at timestamptz default timezone('utc', now()),
     updated_at timestamptz default timezone('utc', now())
   );

   create table if not exists products (
     id bigserial primary key,
     external_id text unique,
     source text,
     title text,
     sku text,
     barcode text,
     stock numeric,
     price numeric,
     currency text,
     brand text,
     category text,
     status text,
     attributes jsonb,
     image_urls jsonb,
     raw_payload jsonb,
     last_synced_at timestamptz,
     created_at timestamptz default timezone('utc', now()),
     updated_at timestamptz default timezone('utc', now())
   );

   create table if not exists sync_logs (
     id bigserial primary key,
     status text,
     message text,
     source text,
     target text,
     synced_count integer,
     failed_count integer,
     details jsonb,
     created_at timestamptz default timezone('utc', now())
   );
   ```

4. Sunucuyu çalıştırın:

   ```bash
   npm run dev
   ```

5. Tarayıcıdan [http://localhost:3000](http://localhost:3000) adresine giderek panele erişebilirsiniz.

## Kullanım

1. **Ayarlar sekmesinde** Trendyol ve WooCommerce API bilgileriniz ile Supabase veri modeline uygun varsayılan değerleri girin.
2. **Ürünler sekmesinde** Supabase'deki mevcut kayıtlar otomatik yüklenir. Arama kutusundan isim/SKU bazlı filtreleme yapabilirsiniz.
3. **Senkronizasyon** düğmesi Trendyol'dan belirlediğiniz adet kadar ürünü çekip Supabase'e yazar ve WooCommerce mağazanıza gönderir.
4. Her başarılı veya hatalı aktarım sonrası Supabase `sync_logs` tablosuna kayıt düşülür ve arayüzde bilgilendirme yapılır.

> Gerçek Trendyol & WooCommerce API isteklerinin başarılı olabilmesi için ilgili platformlardan üretilecek kimlik bilgilerinin doğru girilmesi gerekir. Bu uygulama, doğru bilgiler girildiğinde doğrudan üretim ortamına bağlanabilecek şekilde kurgulanmıştır.

## API Uçları

| Yöntem | Yol | Açıklama |
| --- | --- | --- |
| `GET` | `/api/settings` | Supabase'deki entegrasyon ayarlarını döner. |
| `PUT` | `/api/settings` | Ayarları günceller (body JSON). |
| `GET` | `/api/products?search=` | Ürünleri listeler, opsiyonel arama parametresi destekler. |
| `POST` | `/api/products/sync` | Trendyol → WooCommerce senkronizasyonunu başlatır (`{ "limit": 20 }`). |

## Geliştirme Notları

- Proje herhangi bir paket yöneticisi bağımlılığı olmadan çalışır; Node.js 18+ yeterlidir.
- `npm run lint` komutu şimdilik bilgilendirme amaçlıdır.
- Trendyol ve WooCommerce servisleri `fetch` kullanarak direkt REST API çağrıları yapacak şekilde hazırlanmıştır.
- Supabase entegrasyonu REST API üzerinden `Service Role` anahtarı kullanır; ek bir Supabase SDK'sına ihtiyaç duymaz.

## Gelecek Adımlar

- 🔁 Fiyat stratejisine göre WooCommerce fiyat güncelleme opsiyonlarını genişletmek.
- 📅 Senkronizasyonu zamanlamak için cron tabanlı görev eklemek.
- 📊 Dashboard bölümüne senkronizasyon istatistik kartları eklemek.
- ➕ Hepsiburada, N11 gibi yeni pazar yeri bağlantıları eklemek.

---

Sorularınız veya geliştirme talepleriniz için katkıda bulunabilirsiniz. İyi satışlar!
