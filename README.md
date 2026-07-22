# Ledger — Subscription Tracker

Dashboard sederhana untuk melacak subscription software/tools dan jadwal renewal-nya. Dibangun dengan React + Vite + Tailwind CSS.

## Menjalankan secara lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`.

## Build untuk production

```bash
npm run build
npm run preview   # opsional, untuk cek hasil build
```

## Fitur

- Tambah / edit / hapus subscription
- Status (Active, Expiring Soon, Expired, Cancelled) dihitung otomatis dari tanggal renewal — kecuali di-override manual jadi "Cancelled"
- Dashboard ringkasan: total, active, expiring soon, expired, dan total monthly spend
- Search & filter by status
- Sort kolom (klik header tabel)
- Indikator visual untuk renewal yang mendekat (≤14 hari)
- Export ke CSV

## Penyimpanan data

Versi ini menyimpan data di `localStorage` browser (per perangkat, per browser), lihat `src/utils/storage.js`. Ini cocok untuk demo/personal use, tapi **tidak cocok untuk tim** karena data tidak tersinkron antar user/device. Lihat rekomendasi database dari Claude untuk upgrade ke penyimpanan multi-user.
