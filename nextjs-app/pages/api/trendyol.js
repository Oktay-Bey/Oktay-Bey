export default function handler(req, res) {
  res.status(200).json([
    { id: 1, name: 'Trendyol Ürün 1', description: 'Açıklama 1' },
    { id: 2, name: 'Trendyol Ürün 2', description: 'Açıklama 2' }
  ]);
}
