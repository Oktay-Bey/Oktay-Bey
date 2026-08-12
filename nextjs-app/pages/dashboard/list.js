export default function ProductList() {
  const products = [
    { id: 1, name: 'Örnek Ürün 1' },
    { id: 2, name: 'Örnek Ürün 2' },
  ];

  return (
    <div>
      <h1>Ürün Listesi</h1>
      <ul>
        {products.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
    </div>
  );
}
