import './globals.css';

export const metadata = { title: 'Toko Alat Tulis Online', description: 'Toko Alat Tulis - Next.js' };

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
