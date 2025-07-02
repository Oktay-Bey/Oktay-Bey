import Link from 'next/link';

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <ul>
        <li><Link href="/dashboard/create">Ürün Oluştur</Link></li>
        <li><Link href="/dashboard/list">Ürün Listesi</Link></li>
        <li><Link href="/dashboard/trendyol">Trendyol Ürünleri</Link></li>
        <li><Link href="/dashboard/hepsiburada">Hepsiburada Ürünleri</Link></li>
      </ul>
    </div>
  );
}
