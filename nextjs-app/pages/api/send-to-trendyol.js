export default function handler(req, res) {
  if (req.method === 'POST') {
    // Burada normalde Trendyol API'ye istek yapilirdi.
    res.status(200).json({ message: 'Ürün Trendyol\'a gönderildi' });
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
