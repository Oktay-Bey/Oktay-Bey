import { useState } from 'react';

export default function CreateProduct() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Ürün oluşturuldu: ${name}`);
    setName('');
    setDescription('');
  };

  return (
    <div>
      <h1>Ürün Oluştur</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Adı: </label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label>Açıklama: </label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <button type="submit">Kaydet</button>
      </form>
    </div>
  );
}
