import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <h1>Merhaba Next.js</h1>
      <p>Bu basit bir Next.js projesidir.</p>
      <p>
        <Link href="/dashboard">Dashboarda Git</Link>
      </p>
    </div>
  );
}
