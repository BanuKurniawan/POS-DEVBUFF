# KasirSimpel — Migrasi Development dari Docker ke XAMPP

## Tujuan

Ubah alur development lokal KasirSimpel agar dapat berjalan pada laptop dengan RAM 4 GB tanpa Docker Desktop.

Gunakan:
- XAMPP sebagai penyedia MySQL lokal.
- Prisma sebagai ORM.
- Next.js sebagai aplikasi (sesuaikan dengan framework aktual di `package.json`).
- phpMyAdmin dari XAMPP sebagai pengelola database.

**Penting:** Jangan mengubah skema bisnis, model Prisma, fitur aplikasi, atau data yang sudah ada tanpa alasan. Jangan menghapus Dockerfile/compose yang masih diperlukan untuk deployment. Fokus perubahan ini adalah alur development lokal.

---

## 1. Audit project sebelum mengubah

Periksa terlebih dahulu:
- `package.json`
- `scripts/db-setup.mjs`
- `prisma/schema.prisma`
- `prisma.config.ts` jika ada
- `docker-compose.yml` atau `compose.yaml`
- `.env`, `.env.example`, dan dokumentasi setup

Identifikasi versi `prisma` dan `@prisma/client`. Keduanya harus kompatibel dan sebaiknya menggunakan versi yang sama. Jangan melakukan upgrade major Prisma sebagai bagian dari pekerjaan ini.

Jika project masih memakai Prisma 6, pertahankan Prisma 6 dan format datasource yang sesuai. Jika project sudah memakai Prisma 7, pertahankan Prisma 7 dan ikuti konfigurasi `prisma.config.ts` serta kebutuhan driver adapter Prisma 7. Jangan mencampur konfigurasi Prisma 6 dan Prisma 7.

Sebelum mengedit, jelaskan file yang akan diubah dan alasan perubahannya.

---

## 2. Prasyarat XAMPP

1. Install dan buka XAMPP Control Panel.
2. Start service **MySQL**.
3. Pastikan MySQL berjalan pada port `3306` (atau gunakan port aktual yang dikonfigurasi).
4. Buka `http://localhost/phpmyadmin`.
5. Buat database dengan nama `kasir_simpel`, menggunakan collation `utf8mb4_unicode_ci` jika tersedia.

Jika port 3306 sedang digunakan service lain, jangan mematikan service secara sembarangan. Periksa port yang digunakan dan sesuaikan `DATABASE_URL`.

---

## 3. Environment variable

Tambahkan atau sesuaikan `.env` di root project.

Contoh konfigurasi XAMPP default tanpa password root:

```env
DATABASE_URL="mysql://root:@127.0.0.1:3306/kasir_simpel"
```

Jika root MySQL memiliki password:

```env
DATABASE_URL="mysql://root:PASSWORD@127.0.0.1:3306/kasir_simpel"
```

Ganti `PASSWORD` dengan password aktual. Jika password mengandung karakter khusus seperti `@`, `#`, `/`, atau `:`, lakukan URL encoding.

Jangan commit `.env` ke Git. Pastikan `.env` tercantum dalam `.gitignore`. Perbarui `.env.example` dengan placeholder, bukan password asli:

```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@127.0.0.1:3306/kasir_simpel"
```

Untuk XAMPP default tanpa password, dokumentasikan bahwa bagian password dikosongkan.

---

## 4. Konfigurasi Prisma

### Jika menggunakan Prisma 6

Pertahankan datasource di `prisma/schema.prisma` seperti berikut:

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

Pastikan generator tetap sesuai dengan project. Contoh umum:

```prisma
generator client {
  provider = "prisma-client-js"
}
```

### Jika menggunakan Prisma 7

Jangan menaruh `url` di blok datasource pada `schema.prisma`. Gunakan konfigurasi Prisma 7 yang sesuai, misalnya `prisma.config.ts` untuk URL migrasi dan driver adapter yang kompatibel untuk koneksi runtime MySQL.

Jangan menambahkan adapter atau mengganti versi package tanpa memeriksa versi Prisma dan implementasi `PrismaClient` yang sudah ada.

---

## 5. Ubah script database setup

Perbarui `scripts/db-setup.mjs` agar tidak menjalankan Docker, tidak menjalankan `docker compose`, dan tidak menarik image MySQL atau Adminer.

Alur `db:setup` yang baru:

1. Memastikan `DATABASE_URL` tersedia.
2. Memastikan host dan port database dapat dijangkau.
3. Menampilkan instruksi yang jelas jika MySQL XAMPP belum aktif.
4. Memastikan database `kasir_simpel` sudah dibuat. Jangan otomatis menghapus atau me-reset database.
5. Menjalankan Prisma Client generation.
6. Menjalankan migrasi sesuai strategi project:
   - Development baru: `prisma migrate dev`.
   - Database yang sudah memiliki migrasi dan dipakai untuk deployment: jangan gunakan `migrate reset`.
   - Jangan menggunakan `db push` untuk menggantikan migration workflow tanpa alasan dan persetujuan.
7. Mengembalikan exit code bukan nol jika salah satu tahap gagal.

Gunakan Node.js bawaan (`node:net`, `node:child_process`, `node:process`) bila sesuai. Hindari menambahkan dependency baru hanya untuk mengecek port.

Pengecekan TCP ke host dan port hanya membuktikan server menerima koneksi; autentikasi dan keberadaan database tetap perlu diverifikasi oleh Prisma.

Pesan error harus membantu, misalnya:

```text
MySQL belum dapat diakses di 127.0.0.1:3306.
Buka XAMPP Control Panel, jalankan MySQL, lalu ulangi npm run db:setup.
Pastikan database kasir_simpel sudah dibuat di phpMyAdmin.
```

Jangan menampilkan password database di log.

---

## 6. Perbarui scripts di package.json

Periksa scripts yang sudah ada dan pertahankan perintah lain yang masih diperlukan. Sediakan setidaknya perintah berikut dengan penyesuaian versi Prisma:

```json
{
  "scripts": {
    "db:setup": "node scripts/db-setup.mjs",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start"
  }
}
```

Contoh di atas mengasumsikan Next.js dan Prisma CLI tersedia secara lokal. Jika framework atau scripts project berbeda, jangan menyalin secara membabi buta; pertahankan command yang benar untuk project aktual.

Hindari `npx` yang berpotensi mengunduh versi package yang tidak sesuai. Gunakan binary lokal melalui npm scripts.

Jangan membuat `db:setup` menjalankan `npm install` atau mengubah versi dependency secara otomatis.

---

## 7. Cara menjalankan project setelah perubahan

### Persiapan pertama kali

1. Jalankan XAMPP Control Panel.
2. Start MySQL.
3. Pastikan database `kasir_simpel` sudah dibuat melalui phpMyAdmin.
4. Pastikan `.env` sudah berisi `DATABASE_URL` yang benar.
5. Dari terminal di root project, jalankan:

```bash
npm install
npm run db:setup
```

### Menjalankan aplikasi setiap hari

Setelah setup database berhasil, cukup:

```bash
npm run dev
```

Tidak perlu menjalankan Docker Desktop, container MySQL, atau Adminer.

### Perintah tambahan

```bash
npm run db:generate
npm run db:migrate
npm run db:studio
npm run build
```

Jalankan migrasi hanya saat ada perubahan schema atau migrasi yang memang perlu diterapkan.

---

## 8. Kriteria penerimaan

Perubahan dianggap selesai jika:

- [ ] `npm run db:setup` tidak memanggil Docker atau Docker Compose.
- [ ] Setup dapat menggunakan MySQL XAMPP lokal.
- [ ] Pesan error jelas jika MySQL belum aktif.
- [ ] Prisma Client berhasil di-generate.
- [ ] Migrasi dapat berjalan tanpa reset database.
- [ ] Aplikasi dapat dijalankan dengan `npm run dev`.
- [ ] Fitur aplikasi dan model database tidak berubah akibat migrasi setup.
- [ ] `.env` tidak ikut ter-commit.
- [ ] Dokumentasi README menjelaskan instalasi XAMPP dan cara menjalankan project.
- [ ] File Docker untuk deployment tidak dihapus tanpa persetujuan.

---

## 9. Instruksi penting untuk AI coding assistant

Lakukan perubahan langsung pada file project, bukan hanya memberikan contoh kode.

Sebelum mengubah:
1. Audit versi Prisma, framework, dan struktur scripts yang aktual.
2. Tampilkan ringkasan rencana perubahan.
3. Pertahankan dependency dan versi yang sudah kompatibel.
4. Jangan menghapus data, migration, volume, atau file deployment.
5. Jangan melakukan `prisma migrate reset`, `db push --force-reset`, atau perintah destruktif lainnya.

Setelah mengubah:
1. Tampilkan daftar file yang diubah.
2. Jelaskan perubahan setiap file.
3. Jalankan pemeriksaan yang aman seperti validasi schema, generate, dan build jika environment memungkinkan.
4. Jika MySQL lokal belum aktif, jangan mengklaim koneksi atau migrasi database berhasil.
5. Berikan langkah manual yang perlu dilakukan pengguna di XAMPP.

**Hasil akhir yang diharapkan:** development KasirSimpel berjalan dengan Next.js dan Prisma yang terhubung ke MySQL lokal XAMPP, tanpa membutuhkan Docker Desktop pada laptop RAM 4 GB.
