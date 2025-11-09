'use client';
// ===========================
// WEBSITE PENJUALAN ALAT TULIS
// Versi dengan komentar lengkap + Perbaikan JSX + Fitur: Detail Produk & Checkout WhatsApp
// Perbaikan bug: string newline di buildWhatsAppText -> gunakan "\n" (hindari unterminated string)
// Tambahan: helper pure function + self-tests ringan di console
// ===========================

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Search,
  Trash2,
  Minus,
  Plus,
  Filter,
  NotebookPen,
  PenLine,
  Ruler,
  Highlighter,
  Info
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Separator,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";

// Format harga ke mata uang Rupiah
const fmtIDR = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

// Daftar produk (kamu bisa tambah, ganti, atau hapus item disini)
const PRODUCTS = [
  { id: "pen-gel-black", name: "Pulpen Hitam", price: 8000, category: "Pulpen", desc: "Tinta pekat, cepat kering, nyaman dipakai harian.", img: "/img/pulpenhitam.jpeg" },
  { id: "notebook-a5", name: "Kertas A4 1 rim", price: 22000, category: "Buku Catatan", desc: "Kertas halus, cocok untuk kuliah & kantor.", img: "/img/kertasa4.jpg" },
  { id: "penggaris-30", name: "Penggaris Besi 30cm", price: 9000, category: "Penggaris", desc: "Bahan kuat, skala jelas.", img: "/img/penggarisbesi.jpg" },
  { id: "stabilo-pastel", name: "Stabilo Pastel (Set 6)", price: 45000, category: "Highlighter", desc: "Warna lembut, tidak tembus kertas.", img: "/img/stabilo.jpg" },
  { id: "pen-gel-blue", name: "Pulpen Biru", price: 8000, category: "Pulpen", desc: "Flow tinta stabil, nib halus.", img: "/img/pulpenbiru.jpg" },
  { id: "notebook-spiral", name: "Notebook Spiral B5", price: 28000, category: "Buku Catatan", desc: "Mudah dibuka rata, cocok untuk sketsa.", img: "/img/notebook.jpg" },
  { id: "penggaris-lentur", name: "Penggaris Lentur 20cm", price: 7000, category: "Penggaris", desc: "Tidak mudah patah, fleksibel.", img: "/img/penggarislentur.jpg" },
  { id: "sticky-notes", name: "Sticky Notes 3x3", price: 15000, category: "Aksesoris", desc: "Tempel kuat, lepas tanpa bekas.", img: "/img/stickynote.jpg" },
];

// Kategori filter
const CATEGORIES = [
  { label: "Semua", value: "all" },
  { label: "Pulpen", value: "Pulpen", icon: PenLine },
  { label: "Buku Catatan", value: "Buku Catatan", icon: NotebookPen },
  { label: "Penggaris", value: "Penggaris", icon: Ruler },
  { label: "Highlighter", value: "Highlighter", icon: Highlighter },
  { label: "Aksesoris", value: "Aksesoris" },
];

// --- Helper pure function untuk menyusun teks WhatsApp (agar mudah dites)
export function formatWhatsAppText(items /* {name, qty, subtotal}[] */, subtotal) {
  const lines = [
    "Hallo, saya ingin checkout pesanan:",
    ...items.map((it) => `- ${it.name} x ${it.qty} = ${fmtIDR(it.subtotal)}`),
    `Subtotal: ${fmtIDR(subtotal)}`,
  ];
  const ongkir = subtotal > 0 ? 15000 : 0;
  lines.push(`Ongkir (estimasi): ${fmtIDR(ongkir)}`);
  lines.push(`Total: ${fmtIDR(subtotal + ongkir)}`);
  // PENTING: gunakan "\n" (newline) agar tidak memecah string literal di JSX/TSX
  return lines.join("\n");
}

export default function ATKMinimalShop() {
  // State utama
  const [dark, setDark] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [openCart, setOpenCart] = useState(false);
  const [openCheckout, setOpenCheckout] = useState(false);
  const [openPayment, setOpenPayment] = useState(false); // modal pemilihan metode pembayaran
  const [payMethod, setPayMethod] = useState('qris'); // qris | gopay | shopeepay | ovo | dana
  const [cart, setCart] = useState([]); // isi keranjang

  // Detail produk (fitur #3)
  const [openDetail, setOpenDetail] = useState(false);
  const [detailItem, setDetailItem] = useState(null); // object produk

  // Ganti tema (dark / light)
  useEffect(() => {
	document.documentElement.classList.remove("dark");
  }, []);

  // Tutup modal/drawer dengan tombol ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (openDetail) setOpenDetail(false);
        if (openCheckout) setOpenCheckout(false);
        if (openCart) setOpenCart(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openDetail, openCheckout, openCart]);

  // Hitung ulang data keranjang lengkap (produk + qty + subtotal)
  const itemsDetailed = useMemo(() => {
    return cart.map((c) => {
      const p = PRODUCTS.find((x) => x.id === c.id);
      return { ...p, qty: c.qty, subtotal: p.price * c.qty };
    });
  }, [cart]);

  // Total harga
  const total = useMemo(() => itemsDetailed.reduce((a, b) => a + b.subtotal, 0), [itemsDetailed]);

  // Filter produk berdasarkan kategori & search
  const filtered = useMemo(() => {
    let list = PRODUCTS;
    if (category !== "all") list = list.filter((p) => p.category === category);
    if (query.trim()) list = list.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.desc.toLowerCase().includes(query.toLowerCase()));
    return list;
  }, [category, query]);

  // Fungsi tambah produk ke keranjang
  const addToCart = (id) => {
    setCart((prev) => {
      const found = prev.find((x) => x.id === id);
      if (found) return prev.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x));
      return [...prev, { id, qty: 1 }];
    });
  };

  // Ubah jumlah item
  const changeQty = (id, step) => {
    setCart((prev) => prev.map((x) => (x.id === id ? { ...x, qty: Math.max(0, x.qty + step) } : x)).filter((x) => x.qty > 0));
  };

  // Hapus item dari keranjang
  const removeItem = (id) => setCart((prev) => prev.filter((x) => x.id !== id));

  // Buka detail produk (fitur #3)
  const openProductDetail = (p) => {
    setDetailItem(p);
    setOpenDetail(true);
  };

  // Compose teks untuk WhatsApp Checkout (fitur #4) menggunakan helper pure function
  const buildWhatsAppText = () => formatWhatsAppText(itemsDetailed, total);

  const goWhatsApp = () => {
    const text = buildWhatsAppText();
    const url = `https://wa.me/6285156035296?text=${encodeURIComponent(text)}`; // tambahkan nomor: wa.me/628xxxxxxxxx
    window.open(url, "_blank");
  };
  
    // Selesaikan pembayaran (demo): tutup modal & kosongkan keranjang
  const completePaymentDemo = () => {
    setOpenPayment(false);
    setOpenCheckout(false);
    setCart([]);
    alert('Pembayaran berhasil (demo). Integrasikan gateway pada produksi.');
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 transition-colors">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-slate-900 to-slate-600" />
            <span className="font-semibold tracking-tight">Toko Alat Tulis Online</span>
          </motion.div>

          {/* Kolom Search (desktop) */}
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              <Input className="w-64 text-slate-900 placeholder:text-slate-500 bg-white" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari produk" />
              
            </div>

            {/* Tombol Keranjang */}
<Button variant="default" className="gap-2" onClick={() => setOpenCart(true)}>
  <ShoppingCart className="h-4 w-4" /> Keranjang ({cart.reduce((a, b) => a + b.qty, 0)})
</Button>
          </div>
        </div>
      </header>

      {/* CART DRAWER (custom) */}
      {openCart && (
        <div className="fixed inset-0 z-40" onClick={() => setOpenCart(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute top-0 right-0 h-full w-full sm:max-w-md bg-white shadow-xl p-4" onClick={(e)=>e.stopPropagation()}>
            <div className="text-lg font-bold mb-2">Keranjang Belanja</div>
            <div className="mt-2 space-y-4">
              {itemsDetailed.length === 0 ? (
                <p className="text-sm text-slate-500">Keranjang masih kosong</p>
              ) : (
                itemsDetailed.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4 flex gap-3 items-start">
                      <img src={item.img} alt={item.name} className="h-12 w-12 rounded-md object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium leading-tight text-slate-900">{item.name}</p>
                            <p className="text-xs text-slate-500">{fmtIDR(item.price)} • {item.category}</p>
                          </div>
                          <Button variant="ghost" size="sm" className="h-9 w-9 p-0" onClick={() => removeItem(item.id)} aria-label="Remove">✕</Button>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-9 w-9 p-0" onClick={() => changeQty(item.id, -1)}>-</Button>
                            <span className="w-8 text-center">{item.qty}</span>
                            <Button variant="outline" size="sm" className="h-9 w-9 p-0" onClick={() => changeQty(item.id, +1)}>+</Button>
                          </div>
                          <span className="font-medium text-slate-900">{fmtIDR(item.subtotal)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Subtotal</span>
                <span className="font-semibold text-slate-900">{fmtIDR(total)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button disabled={itemsDetailed.length === 0} onClick={() => {setOpenCheckout(true); setOpenCart(false);}}>Lanjut Checkout</Button>
                <Button variant="secondary" disabled={itemsDetailed.length === 0} onClick={goWhatsApp}>WhatsApp</Button>
              </div>
              <Button variant="outline" className="w-full" onClick={() => setOpenCart(false)}>Tutup</Button>
            </div>
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">Menyediakan Berbagai Alat Tulis untuk Pelajar, Mahasiswa & Pegawai</h1>
            <p className="mt-3 text-slate-600">Pilihan produk esensial, desain simpel, harga bersahabat. Kirim seluruh Indonesia.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <Button
                  key={c.value}
                  variant={category === c.value ? "default" : "outline"}
                  onClick={() => setCategory(c.value)}
                  className="gap-2 text-slate-900 border-slate-300"
                >
                  {c.icon ? <c.icon className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
                  {c.label}
                </Button>
              ))}
            </div>
            <div className="mt-4 sm:hidden flex gap-2">
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari produk" className="text-slate-900 placeholder:text-slate-500 bg-white text-slate-900" />
              
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden">
              <img src="/img/promo.png" alt="Promo" className="absolute inset-0 w-full h-full object-cover" />
              {/* overlay gelap tipis agar teks terbaca di atas foto */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              {/* badge + caption */}
              <div className="absolute bottom-4 left-4 right-4 space-y-2">
                <div className="inline-flex items-center gap-2 text-sm px-2.5 py-1.5 rounded-md bg-white/90 text-slate-900 w-max shadow-sm">
                  <Info className="h-4 w-4" /> Promo November: Gratis Ongkir s/d {fmtIDR(15000)}
                </div>
                <p className="text-white/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">Tanpa minimum belanja untuk wilayah tertentu.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* GRID PRODUK */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="h-full">
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="text-base leading-tight text-slate-900">
                    <span className="block truncate" title={p.name}>{p.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <img
					src={p.img}
					alt={p.name}
					onClick={() => openProductDetail(p)}
					className="aspect-square w-full object-cover rounded-xl cursor-pointer"
				/>
                  <p className="text-sm text-slate-600 line-clamp-2">{p.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{fmtIDR(p.price)}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openProductDetail(p)}>Detail</Button>
                      <Button size="sm" onClick={() => addToCart(p.id)}>Tambah</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CHECKOUT MODAL (custom) */}
{openCheckout && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setOpenCheckout(false)}>
    <div className="w-full max-w-lg rounded-2xl bg-white p-4" onClick={(e)=>e.stopPropagation()}>
      <div className="text-lg font-bold mb-2 text-slate-900">Ringkasan Pesanan</div>
      {itemsDetailed.length === 0 ? (
        <p className="text-sm text-slate-500">Belum ada item di keranjang.</p>
      ) : (
        <div className="space-y-3">
          <div className="space-y-2 max-h-64 overflow-auto pr-1">
            {itemsDetailed.map((it) => (
              <div key={it.id} className="flex items-center justify-between text-sm">
                <span className="truncate mr-2">{it.name} × {it.qty}</span>
                <span className="font-medium text-slate-900">{fmtIDR(it.subtotal)}</span>
              </div>
            ))}
          </div>
          <Separator />
          <div className="flex items-center justify-between"><span className="text-sm text-slate-500">Subtotal</span><span className="font-semibold">{fmtIDR(total)}</span></div>
          <div className="flex items-center justify-between"><span className="text-sm text-slate-500">Ongkir (estimasi)</span><span className="font-semibold">{fmtIDR(total>0?15000:0)}</span></div>
          <div className="flex items-center justify-between text-lg"><span className="font-semibold">Total</span><span className="font-bold">{fmtIDR(total+(total>0?15000:0))}</span></div>
          <div className="grid grid-cols-2 gap-2">
            <Button className="w-full" onClick={() => setOpenPayment(true)}>Pilih Metode Pembayaran</Button>
            <Button variant="secondary" className="w-full" onClick={goWhatsApp}>Checkout WA</Button>
          </div>
          <Button variant="outline" className="w-full" onClick={()=>setOpenCheckout(false)}>Tutup</Button>
        </div>
      )}
    </div>
  </div>
)}

      {/* PAYMENT MODAL (pilihan metode) */}
{openPayment && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setOpenPayment(false)}>
    <div className="w-full max-w-lg rounded-2xl bg-white p-4" onClick={(e)=>e.stopPropagation()}>
      <div className="text-lg font-bold mb-3 text-slate-900">Pilih Metode Pembayaran</div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {['qris','gopay','shopeepay','ovo','dana'].map((m)=> (
          <Button key={m} variant={payMethod===m?'default':'outline'} className="capitalize" onClick={()=>setPayMethod(m)}>
            {m}
          </Button>
        ))}
      </div>
      <div className="rounded-xl border border-slate-200 p-3 mb-4 text-sm text-slate-600">
        {payMethod==='qris' ? (
          <p>QRIS cocok untuk semua e-wallet (GoPay, ShopeePay, OVO, DANA, dll). Di produksi, tampilkan QR dinamis dari payment gateway Anda.</p>
        ) : (
          <p>Di produksi, arahkan ke halaman/SDK {payMethod.toUpperCase()} dari payment gateway Anda melalui payment gateway (Midtrans, Xendit, Tripay, dsb.).</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={completePaymentDemo}>Bayar (Demo)</Button>
        <Button variant="outline" onClick={()=>setOpenPayment(false)}>Tutup</Button>
      </div>
    </div>
  </div>
)}

      {/* DETAIL MODAL (custom) */}
{openDetail && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setOpenDetail(false)}>
    <div className="w-full max-w-lg rounded-2xl bg-white p-4" onClick={(e)=>e.stopPropagation()}>
      <div className="text-lg font-bold mb-2 text-slate-900">Detail Produk</div>
      {!detailItem ? (
        <p className="text-sm text-slate-500">Tidak ada produk dipilih.</p>
      ) : (
        <div className="space-y-4">
          <img src={detailItem.img} alt={detailItem.name} className="aspect-[16/10] w-full object-cover rounded-xl" />
          <div>
            <p className="font-semibold text-slate-900">{detailItem.name}</p>
            <p className="text-sm text-slate-500">Kategori: {detailItem.category}</p>
          </div>
          <p className="text-sm text-slate-900">{detailItem.desc}</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-slate-900">{fmtIDR(detailItem.price)}</span>
            <Button onClick={() => { addToCart(detailItem.id); setOpenDetail(false); }}>Tambah ke Keranjang</Button>
          </div>
          <Button variant="outline" className="w-full" onClick={()=>setOpenDetail(false)}>Tutup</Button>
        </div>
      )}
    </div>
  </div>
)}

      {/* FOOTER */}
      <footer className="border-t border-slate-200 py-8 mt-6">
        <div className="max-w-7xl mx-auto px-4 text-sm text-slate-500 flex flex-col sm:flex-row gap-2 sm:gap-4 justify-between">
          <span>© {new Date().getFullYear()} ATK Minimal. Semua hak cipta dilindungi.</span>
          <div className="flex gap-4">
            <a className="hover:underline" href="#">Kebijakan Privasi</a>
            <a className="hover:underline" href="#">Syarat & Ketentuan</a>
            <a className="hover:underline" href="#">Kontak</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ===========================
// Self-tests ringan (akan muncul di console dev)
// Jalankan otomatis sekali saat modul dimuat
// ===========================
(function runSelfTests(){
  try {
    const items = [
      { name: "Pulpen Gel Hitam 0.5mm", qty: 2, subtotal: 16000 },
      { name: "Notebook A5 100 Lbr", qty: 1, subtotal: 22000 },
    ];
    const subtotal = 38000;
    const text = formatWhatsAppText(items, subtotal);

    // Test 1: menggunakan \n sebagai pemisah baris
    console.assert(text.includes("\n"), "[Test 1] Teks WA harus menggunakan newline (\\n)");

    // Test 2: total = subtotal + ongkir(15000)
    console.assert(text.includes("Total: " + fmtIDR(subtotal + 15000)), "[Test 2] Perhitungan total salah");

    // Test 3: jika subtotal 0 -> ongkir 0
    const text2 = formatWhatsAppText([], 0);
    console.assert(text2.includes("Ongkir (estimasi): " + fmtIDR(0)), "[Test 3] Ongkir harus 0 saat subtotal 0");
  } catch(e) {
    console.warn("Self-tests gagal dijalankan:", e);
  }
})();
