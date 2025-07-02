import { useEffect, useState } from 'react';
import axios from 'axios';

export default function HepsiburadaProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await axios.get('/api/hepsiburada');
      setProducts(data);
    }
    fetchProducts();
  }, []);

  const sendToTrendyol = async (product) => {
    await axios.post('/api/send-to-trendyol', product);
    alert(`${product.name} Trendyol'a gönderildi`);
  };

  return (
    <div>
      <h1>Hepsiburada Ürünleri</h1>
      <ul>
        {products.map((p) => (
          <li key={p.id} style={{ marginBottom: '1rem' }}>
            <div>{p.name}</div>
            <div>{p.description}</div>
            <button onClick={() => sendToTrendyol(p)}>
              Trendyol'a Gönder
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
