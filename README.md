# DreamTracker AI

Android Studio ile uyumlu bu örnek proje, rüyalarınızı kaydetmenize, geçmiş kayıtları görüntülemenize ve basit yapay zekâ destekli analizler üretmenize yardımcı olur. Kodlar `dream-diary/` klasörü altında Kotlin + Jetpack Compose kullanılarak hazırlanmıştır.

## Öne Çıkan Özellikler
- 📓 Başlık, açıklama, etiket, ruh hâli ve lucidlik yüzdesi ile rüya kaydı
- 🤖 Anahtar kelime tabanlı DreamAnalyzer sınıfı ile çevrimdışı yapay zekâ analizi
- 📊 Anlık ruh hâli/detay kartları ve uyku önerileri
- 🧱 MVVM mimarisi, Compose Material 3 tasarımı ve StateFlow tabanlı durum yönetimi

## Çalıştırma
1. Android Studio (Giraffe+), Android SDK 34 ve JDK 17 kurulu olmalıdır.
2. `dream-diary` klasörünü Android Studio ile açın.
3. Gerekli Gradle bağımlılıkları otomatik olarak indirilecektir.
4. Bir emülatör veya fiziksel cihaz seçip **Run ▶** düğmesine basın.

## Yapay Zekâ Analizi Nasıl Çalışır?
`DreamAnalyzer` sınıfı rüya açıklamasındaki sembolleri ve ruh hâlini basit kurallarla puanlar. Gerçek bir projede bu katmana OpenAI, Vertex AI ya da on-device MLKit modelleri bağlanabilir. Entegrasyon noktaları koda yorum olarak eklenmiştir.

## Ekran Görüntüsü
Uygulama Compose bileşenleri ile modern bir kart düzeni kullanır; en üstte rüya ekleme formu, altında AI özetlerini içeren kart listesi bulunur.
