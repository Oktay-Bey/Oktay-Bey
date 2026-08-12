export default function handler(req, res) {
  res.status(200).json([
    { id: 1, name: 'Hepsiburada Ürün 1', description: 'Açıklama 1' },
    { id: 2, name: 'Hepsiburada Ürün 2', description: 'Açıklama 2' }
  ]);
}
