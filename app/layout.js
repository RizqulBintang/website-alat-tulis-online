import './globals.css';
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = { title: 'Kerajinan Tangan', description: 'Kerajinan Tangan - Next.js' };

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        {children}
		<Analytics />
		<SpeedInsights />
      </body>
    </html>
  );
}
