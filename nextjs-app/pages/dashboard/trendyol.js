import { useEffect, useState } from 'react';
import axios from 'axios';

export default function TrendyolProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await axios.get('/api/trendyol');
      setProducts(data);
    }
    fetchProducts();
  }, []);

  const sendToHepsiburada = async (product) => {
    await axios.post('/api/send-to-hepsiburada', product);
    alert(`${product.name} Hepsiburada'ya gönderildi`);
  };

  return (
    <div>
      <h1>Trendyol Ürünleri</h1>
      <ul>
        {products.map((p) => (
          <li key={p.id} style={{ marginBottom: '1rem' }}>
            <div>{p.name}</div>
            <div>{p.description}</div>
            <button onClick={() => sendToHepsiburada(p)}>
              Hepsiburada'ya Gönder
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
