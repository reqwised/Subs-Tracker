# Ledger — Subscription Tracker (Supabase + Multi-user)

Dashboard untuk melacak subscription software/tools dan jadwal renewal-nya. React + Vite + Tailwind di frontend, Supabase (Postgres + Auth + Realtime) di backend. Semua user yang login melihat & mengelola **satu shared list yang sama** (cocok untuk dashboard tim), dengan perubahan yang sync realtime antar user.

## 1. Buat project Supabase

1. Buka [supabase.com](https://supabase.com) → **New Project**
2. Catat **Project URL** dan **anon public key** (Project Settings → API) — dibutuhkan di step 3

## 2. Jalankan SQL schema

1. Di Supabase Dashboard, buka **SQL Editor → New query**
2. Copy seluruh isi `supabase/schema.sql` dari project ini, paste, lalu **Run**

Ini akan membuat:
- Tabel `subscriptions` (name, department, renewal_date, monthly_cost, status, notes, created_by, timestamps)
- Trigger auto-update `updated_at`
- Row Level Security: siapapun yang **sudah login** (authenticated) boleh select/insert/update/delete — karena ini shared team dashboard, bukan data privat per-user
- Realtime enabled di tabel tsb, supaya semua user lihat perubahan secara live
- 5 baris data contoh (opsional, boleh dihapus dari script kalau tidak mau)

## 3. Buat 3 user testing

Paling gampang lewat Dashboard (tidak perlu SQL manual ke tabel `auth.users`, karena itu tabel internal Supabase):

1. Buka **Authentication → Users → Add user → Create new user**
2. Isi email + password, lalu **centang "Auto Confirm User"** (supaya tidak perlu verifikasi email saat testing)
3. Ulangi 3x, misalnya:

| Email | Password |
|---|---|
| tester1@ledger.app | Testing123! |
| tester2@ledger.app | Testing123! |
| tester3@ledger.app | Testing123! |

Ganti password sesuai kebutuhan. Ketiganya bisa login bersamaan dari device berbeda dan akan melihat data yang sama secara realtime.

> Kalau nanti mau publik bisa sign-up sendiri (bukan cuma 3 akun manual), aktifkan lagi email confirmation di **Authentication → Settings** dan buka opsi sign-up di aplikasi (saat ini app cuma punya form sign-in, sesuai kebutuhan testing).

## 4. Setup environment variable lokal

```bash
cp .env.example .env.local
```

Isi `.env.local`:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

## 5. Jalankan lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`, login pakai salah satu dari 3 user testing di atas.

## 6. Deploy ke Vercel

Sama seperti sebelumnya (Import project dari GitHub / `vercel` CLI), **tambahan wajib**: set environment variables di Vercel supaya build production juga bisa connect ke Supabase.

1. Di Vercel project → **Settings → Environment Variables**
2. Tambahkan:
   - `VITE_SUPABASE_URL` = URL project Supabase kamu
   - `VITE_SUPABASE_ANON_KEY` = anon public key kamu
3. Redeploy (atau deploy pertama kali setelah env var diisi)

Anon key aman untuk ditaruh di frontend/env publik — akses data tetap dikontrol lewat Row Level Security di database, bukan lewat merahasiakan key ini.

## Fitur

- Login multi-user (Supabase Auth)
- Data subscription shared, sync realtime antar user (Supabase Realtime)
- Tambah / edit / hapus subscription
- Status (Active, Expiring Soon, Expired, Cancelled) dihitung otomatis dari tanggal renewal — kecuali di-override manual jadi "Cancelled"
- Dashboard ringkasan: total, active, expiring soon, expired, monthly spend
- Search & filter by status, sort kolom
- Indikator visual untuk renewal yang mendekat (≤14 hari)
- Export ke CSV

## Struktur project

```
src/
  lib/supabaseClient.js       Supabase client (baca dari env var)
  context/AuthContext.jsx     Session state + signIn/signOut
  utils/supabaseData.js       CRUD + realtime subscription ke tabel subscriptions
  components/Login.jsx        Form sign-in
  components/Dashboard.jsx    Kartu ringkasan
  components/SubscriptionForm.jsx   Modal add/edit
  components/SubscriptionTable.jsx  Tabel + search/filter/sort
supabase/schema.sql           SQL untuk setup tabel, RLS, realtime, seed data
```

## Catatan keamanan (RLS)

Policy saat ini: **siapapun yang login boleh baca & ubah semua row** — sesuai brief "3 user testing" yang perlu lihat dashboard yang sama. Kalau nanti butuh privasi per-department (misal, department A tidak boleh edit subscription department B), tinggal ubah policy di `supabase/schema.sql` untuk cek `department` atau tambah tabel `user_departments` dan filter `using ()` sesuai itu — tanya saja kalau butuh bantuan ini.
