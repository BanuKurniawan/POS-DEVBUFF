# KasirKITA — Sistem Point of Sales & Manajemen Stok UMKM

<p align="center">
  <strong>Solusi lengkap aplikasi Kasir Modern (POS) dan Manajemen Stok Barang terintegrasi untuk Toko Sembako, Retail, dan Warung UMKM.</strong>
</p>

<p align="center">
  Dibangun dengan <strong>Next.js 16 (App Router)</strong>, <strong>React 19</strong>, <strong>Tailwind CSS v4</strong>, <strong>MySQL 8.0</strong>, dan <strong>Prisma ORM</strong>. Dilengkapi sistem proteksi transaksi database-backed <em>(Idempotency & Concurrency Safety)</em>.
</p>

---

## 🌟 Fitur Unggulan

### 1. Sistem Kasir / Point of Sales (`/pos`)
- **Desain Responsif Desktop & Mobile**: Nyaman digunakan di PC desktop, tablet, maupun smartphone kasir dengan drawer keranjang belanja cerdas.
- **Pencarian Cepat**: Cari barang instan via nama, SKU, atau pemindaian Barcode.
- **Multi Metode Pembayaran**:
  - Tunai (dengan hitung cepat kembalian & nominal pas)
  - QRIS (dengan pratinjau dummy QR dinamis)
  - Debit Card
  - Transfer Bank (menampilkan nomor rekening tujuan)
- **Konfirmasi Pembayaran Sebelum Keluar Struk**: Memastikan uang tunai, transfer, atau QRIS telah masuk sebelum pesanan difinalisasi dan struk dicetak.
- **Tahan & Panggil Transaksi (*Hold & Recall Order*)**: Simpan antrean belanjaan pelanggan saat ini untuk melayani pelanggan berikutnya tanpa kehilangan keranjang.
- **Cetak Struk Belanja**: Format ramah printer thermal (58mm/80mm) yang rapi lengkap dengan logo toko dan rincian transaksi.
- **Shortcut Keyboard Cepat**:
  - `F2` atau `/` : Fokus langsung ke kolom pencarian barang
  - `F9` : Buka proses pembayaran
  - `Spasi` : Set uang tunai sesuai total tagihan (*uang pas*)
  - `Esc` : Batalkan / tutup modal

### 2. Manajemen Stok Barang Masuk & Keluar (`/stock-in` & `/products`)
- **Pencatatan Stok Masuk (*Stock In*)**: Form penerimaan barang dari supplier dengan pilihan produk cepat dan tombol kuantitas kilat (+10, +25, +50, +100).
- **Riwayat Mutasi Stok (*Stock Movements*)**:
  - Mencatat setiap pergerakan barang (Masuk / *IN* & Keluar / *OUT*).
  - Dilengkapi detail stok sebelum (*stockBefore*), stok sesudah (*stockAfter*), tanggal & jam, catatan pengiriman, dan nama petugas/kasir.
  - Filter interaktif (Semua, Barang Masuk, Barang Keluar) dan pencarian nama produk / SKU.
  - **Paginasi Halaman Riwayat** (maksimal 5 entri per halaman) agar tampilan tetap ringkas dan tidak memanjang ke bawah.
- **Peringatan Stok Menipis (*Low Stock Warning*)**: Notifikasi otomatis saat stok berada di bawah batas minimum yang ditentukan.

### 3. Keamanan Transaksi & Anti-Duplikasi (*Idempotency & Concurrency Safety*)
- **Perlindungan Idempotensi Berbasis Database**: Mencegah transaksi terproses dobel akibat *double-click* kasir, jaringan lemot (*network retry*), atau *refresh* browser.
- **InnoDB Row Lock Mutex**: Menjamin dua transaksi bersamaan tidak menyebabkan pemotongan stok ganda (*double-deduction*) atau over-selling saat stok menipis.
- **Payload Integrity Matching**: Validasi hash SHA-256 untuk mendeteksi manipulasi parameter request.

### 4. Dashboard Analisis & Laporan (`/dashboard` & `/transactions`)
- Ringkasan omzet harian/bulanan, laba kotor toko, total transaksi penjualan, dan barang terlaris.
- Grafik performa pendapatan harian.
- Riwayat transaksi penjualan lengkap dengan filter tanggal dan ekspor data ke format file Excel / CSV.

### 5. Manajemen Karyawan & Pengaturan Toko (`/settings`)
- **Hak Akses (*Role-Based Access*)**:
  - **Pemilik Toko (OWNER)**: Akses penuh ke seluruh menu, laporan laba rugi, manajemen karyawan, dan pengaturan toko.
  - **Kasir (KARYAWAN)**: Dikhususkan untuk transaksi penjualan di POS dan penerimaan stok barang.
- **Pengaturan Profil Toko**: Kustomisasi nama toko, alamat, nomor kontak, footer struk, serta upload logo toko.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **UI & Runtime**: [React 19](https://react.dev/), TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: [MySQL 8.0](https://www.mysql.com/) (dijalankan via Docker)
- **ORM**: [Prisma ORM](https://www.prisma.io/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📋 Persyaratan Sistem

Sebelum memulai instalasi, pastikan software berikut telah terpasang di komputer Anda:

1. **[Node.js](https://nodejs.org/)** versi 20.x ke atas.
2. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** (pastikan daemon Docker sudah berjalan).
3. **[Git](https://git-scm.com/)**.

---

## 🚀 Panduan Instalasi & Menjalankan

### 1. Clone Repositori
```bash
git clone https://github.com/patihrz/sistem-point-of-sales-kasir-sederhana-umkm.git
cd sistem-point-of-sales-kasir-sederhana-umkm
```

### 2. Instal Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variable
Salin berkas konfigurasi contoh `.env.example` menjadi `.env`:

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**Linux / macOS:**
```bash
cp .env.example .env
```

Konfigurasi standar `.env`:
```env
DATABASE_URL="mysql://root:rootpassword@localhost:3306/kasir_simpel"
NEXTAUTH_SECRET="kunci_rahasia_anda"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="KasirKITA"
NODE_ENV="development"
```

### 4. Setup Database Otomatis (Docker + Migrasi + Data Awal)
Jalankan satu perintah berikut:
```bash
npm run db:setup
```
Perintah ini akan secara otomatis:
- Menjalankan container Docker (MySQL 8.0 di port 3306 & database browser Adminer di port 8080).
- Menerapkan seluruh migrasi skema tabel Prisma.
- Mengisi data awal (*seeding* akun demo, kategori, dan produk sembako).

### 5. Jalankan Aplikasi
```bash
npm run dev
```

Buka browser Anda dan akses:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 👤 Akun Demo untuk Pengujian

| Peran (*Role*) | Email | Password | Akses Fitur |
|---|---|---|---|
| **Pemilik Toko** | `owner@kasir.com` | `owner123` | Semua fitur: Dashboard, Produk, Stok Masuk, Riwayat, Laporan, Pengaturan |
| **Kasir** | `kasir@kasir.com` | `kasir123` | Halaman POS Kasir, Pencatatan Stok Masuk, Riwayat Transaksi |

*(Tersedia tombol login cepat 1-klik di halaman login)*

---

## ⌨️ Daftar Perintah (*NPM Scripts*)

| Perintah | Deskripsi |
|---|---|
| `npm run dev` | Menjalankan server aplikasi Next.js dalam mode development |
| `npm run build` | Menjalankan kompilasi & build optimasi produksi |
| `npm run start` | Menjalankan build produksi di server lokal |
| `npm run db:setup` | Inisialisasi otomatis Docker + migrasi database + seeding data |
| `npm run db:up` | Menyalakan container database Docker (MySQL & Adminer) |
| `npm run db:down` | Mematikan container database Docker |
| `npm run db:seed` | Mengisi ulang data demo produk, kategori, dan akun |
| `npm run test:idempotency` | Menjalankan test suite otomatis konkruensi & proteksi transaksi |

---

## 🗄️ Akses Database GUI (Adminer)

Untuk melihat tabel database secara visual di web browser:
- **URL**: [http://localhost:8080](http://localhost:8080)
- **Sistem**: `MySQL`
- **Server**: `mysql` *(atau `localhost` jika mengakses dari luar docker network)*
- **Username**: `root`
- **Password**: `rootpassword`
- **Database**: `kasir_simpel`

---

## 📄 Lisensi

Proyek ini dirilis secara open-source di bawah lisensi [MIT License](LICENSE). Bebas digunakan, dipelajari, dan dikembangkan untuk kebutuhan UMKM Indonesia.
