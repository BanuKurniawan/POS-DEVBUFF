import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Menyiapkan database Toko Sembako KasirKITA...");

  // 1. Bersihkan transaksi lama, item transaksi, dan pergerakan stok keluar/masuk lama
  console.log("Membersihkan riwayat transaksi & pergerakan stok lama...");
  await prisma.stockMovement.deleteMany();
  await prisma.transactionItem.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 2. Buat Akun Pengguna Utama (Owner & Karyawan)
  const owner = await prisma.user.create({
    data: {
      name: "Budi Gunawan (Owner)",
      email: "owner@kasir.com",
      password: "owner123",
      role: Role.OWNER,
    },
  });

  const karyawan = await prisma.user.create({
    data: {
      name: "Ahmad Kasir (Karyawan)",
      email: "kasir@kasir.com",
      password: "kasir123",
      role: Role.KARYAWAN,
    },
  });

  console.log("Pengguna terdaftar:", [
    { email: owner.email, role: owner.role },
    { email: karyawan.email, role: karyawan.role },
  ]);

  // 3. Buat Kategori Lengkap Toko Sembako
  const catBeras = await prisma.category.create({
    data: { name: "Beras & Aneka Tepung", slug: "beras-tepung", description: "Beras sak/kiloan dan aneka tepung bumbu/kue" },
  });
  const catMinyak = await prisma.category.create({
    data: { name: "Minyak, Mentega & Santan", slug: "minyak-mentega", description: "Minyak goreng pouch/botol, margarin, santan instan" },
  });
  const catBumbu = await prisma.category.create({
    data: { name: "Gula & Bumbu Dapur", slug: "gula-bumbu", description: "Gula pasir, garam, kecap, saus, penyedap rasa" },
  });
  const catMie = await prisma.category.create({
    data: { name: "Mie & Bahan Makanan", slug: "mie-bahan", description: "Mie instan, bihun, soun, makaroni" },
  });
  const catTelur = await prisma.category.create({
    data: { name: "Telur & Olahan Susu", slug: "telur-susu", description: "Telur ayam segar, kental manis, susu UHT, keju" },
  });
  const catMinuman = await prisma.category.create({
    data: { name: "Kopi, Teh & Minuman", slug: "kopi-teh-minuman", description: "Kopi sachet rencengan, teh celup, sirup, air mineral" },
  });
  const catKaleng = await prisma.category.create({
    data: { name: "Makanan Kaleng & Olahan", slug: "makanan-kaleng", description: "Sarden kaleng, kornet sapi, sambal kemasan" },
  });
  const catPembersih = await prisma.category.create({
    data: { name: "Sabun & Pembersih Rumah", slug: "sabun-pembersih", description: "Sabun cuci piring, deterjen, pewangi pakaian, sabun mandi" },
  });
  const catGasLain = await prisma.category.create({
    data: { name: "Gas & Keperluan Rumah", slug: "gas-keperluan-lain", description: "Gas elpiji, galon air, obat nyamuk, korek api" },
  });

  // 4. Daftar Katalog Lengkap Produk Toko Sembako (50 Produk Realistis)
  const sembakoProducts = [
    // --- 1. BERAS & ANEKA TEPUNG ---
    {
      name: "Beras Rojolele Super 5kg",
      sku: "BRS-001",
      barcode: "8991001001",
      price: 72000,
      costPrice: 64000,
      stock: 35,
      minStock: 10,
      unit: "sak",
      categoryId: catBeras.id,
    },
    {
      name: "Beras Pandan Wangi Premium 5kg",
      sku: "BRS-002",
      barcode: "8991001002",
      price: 80000,
      costPrice: 71000,
      stock: 25,
      minStock: 8,
      unit: "sak",
      categoryId: catBeras.id,
    },
    {
      name: "Beras Ramos Setra 5kg",
      sku: "BRS-003",
      barcode: "8991001003",
      price: 68000,
      costPrice: 60000,
      stock: 40,
      minStock: 10,
      unit: "sak",
      categoryId: catBeras.id,
    },
    {
      name: "Beras Ketan Putih 1kg",
      sku: "BRS-004",
      barcode: "8991001004",
      price: 18000,
      costPrice: 15000,
      stock: 20,
      minStock: 5,
      unit: "kg",
      categoryId: catBeras.id,
    },
    {
      name: "Tepung Terigu Segitiga Biru 1kg",
      sku: "TPG-001",
      barcode: "899275911101",
      price: 13500,
      costPrice: 11500,
      stock: 45,
      minStock: 15,
      unit: "bks",
      categoryId: catBeras.id,
    },
    {
      name: "Tepung Terigu Kunci Biru 1kg",
      sku: "TPG-002",
      barcode: "899275911102",
      price: 14000,
      costPrice: 12000,
      stock: 30,
      minStock: 10,
      unit: "bks",
      categoryId: catBeras.id,
    },
    {
      name: "Tepung Beras Rose Brand 500g",
      sku: "TPG-003",
      barcode: "899886610011",
      price: 8500,
      costPrice: 6800,
      stock: 40,
      minStock: 12,
      unit: "bks",
      categoryId: catBeras.id,
    },
    {
      name: "Tepung Tapioka Rose Brand 500g",
      sku: "TPG-004",
      barcode: "899886610012",
      price: 9000,
      costPrice: 7200,
      stock: 35,
      minStock: 10,
      unit: "bks",
      categoryId: catBeras.id,
    },
    {
      name: "Tepung Bumbu Sasa Serbaguna 200g",
      sku: "TPG-005",
      barcode: "899274191011",
      price: 6500,
      costPrice: 5000,
      stock: 50,
      minStock: 15,
      unit: "bks",
      categoryId: catBeras.id,
    },

    // --- 2. MINYAK, MENTEGA & SANTAN ---
    {
      name: "Minyak Goreng Bimoli Klasik 2L",
      sku: "MYK-001",
      barcode: "8991002001",
      price: 37500,
      costPrice: 33500,
      stock: 30,
      minStock: 10,
      unit: "pouch",
      categoryId: catMinyak.id,
    },
    {
      name: "Minyak Goreng SunCo 2L",
      sku: "MYK-002",
      barcode: "8991002002",
      price: 38000,
      costPrice: 34000,
      stock: 28,
      minStock: 8,
      unit: "pouch",
      categoryId: catMinyak.id,
    },
    {
      name: "Minyak Goreng Sania 1L",
      sku: "MYK-003",
      barcode: "8991002003",
      price: 19500,
      costPrice: 17000,
      stock: 40,
      minStock: 10,
      unit: "pouch",
      categoryId: catMinyak.id,
    },
    {
      name: "Minyak Goreng Fortune 1L",
      sku: "MYK-004",
      barcode: "8991002004",
      price: 19000,
      costPrice: 16500,
      stock: 35,
      minStock: 10,
      unit: "pouch",
      categoryId: catMinyak.id,
    },
    {
      name: "Minyakita Kemasan Bantal 1L",
      sku: "MYK-005",
      barcode: "8991002005",
      price: 16000,
      costPrice: 14000,
      stock: 60,
      minStock: 20,
      unit: "bks",
      categoryId: catMinyak.id,
    },
    {
      name: "Margarin Blue Band Serbaguna 200g",
      sku: "MYK-006",
      barcode: "899999912001",
      price: 10500,
      costPrice: 8500,
      stock: 40,
      minStock: 10,
      unit: "bks",
      categoryId: catMinyak.id,
    },
    {
      name: "Santan Kelapa Siap Pakai Kara 65ml",
      sku: "MYK-007",
      barcode: "899888812002",
      price: 3500,
      costPrice: 2600,
      stock: 80,
      minStock: 25,
      unit: "kotak",
      categoryId: catMinyak.id,
    },

    // --- 3. GULA & BUMBU DAPUR ---
    {
      name: "Gula Pasir Gulaku Kuning Premium 1kg",
      sku: "BMB-001",
      barcode: "899275931001",
      price: 18000,
      costPrice: 15500,
      stock: 60,
      minStock: 15,
      unit: "bks",
      categoryId: catBumbu.id,
    },
    {
      name: "Gula Pasir Gulaku Putih Murni 1kg",
      sku: "BMB-002",
      barcode: "899275931002",
      price: 18500,
      costPrice: 16000,
      stock: 50,
      minStock: 15,
      unit: "bks",
      categoryId: catBumbu.id,
    },
    {
      name: "Gula Merah Kelapa Cetak 500g",
      sku: "BMB-003",
      barcode: "8991003003",
      price: 14000,
      costPrice: 11000,
      stock: 25,
      minStock: 8,
      unit: "bks",
      categoryId: catBumbu.id,
    },
    {
      name: "Garam Beryodium Cap Kapal 250g",
      sku: "BMB-004",
      barcode: "899275931004",
      price: 3500,
      costPrice: 2200,
      stock: 70,
      minStock: 20,
      unit: "bks",
      categoryId: catBumbu.id,
    },
    {
      name: "Bango Kecap Manis Refill 550ml",
      sku: "BMB-005",
      barcode: "899999905501",
      price: 25500,
      costPrice: 22000,
      stock: 30,
      minStock: 10,
      unit: "pouch",
      categoryId: catBumbu.id,
    },
    {
      name: "Kecap Manis ABC Refill 520ml",
      sku: "BMB-006",
      barcode: "899999905202",
      price: 21000,
      costPrice: 18000,
      stock: 35,
      minStock: 10,
      unit: "pouch",
      categoryId: catBumbu.id,
    },
    {
      name: "Saus Sambal Extra Pedas ABC 335ml",
      sku: "BMB-007",
      barcode: "899999903351",
      price: 16500,
      costPrice: 13500,
      stock: 25,
      minStock: 8,
      unit: "botol",
      categoryId: catBumbu.id,
    },
    {
      name: "Royco Rasa Ayam 100g",
      sku: "BMB-008",
      barcode: "899999901001",
      price: 5500,
      costPrice: 4200,
      stock: 50,
      minStock: 15,
      unit: "bks",
      categoryId: catBumbu.id,
    },
    {
      name: "Masako Rasa Sapi 100g",
      sku: "BMB-009",
      barcode: "899275931009",
      price: 5500,
      costPrice: 4200,
      stock: 50,
      minStock: 15,
      unit: "bks",
      categoryId: catBumbu.id,
    },
    {
      name: "Ladaku Merica Bubuk Renceng (12 sachet)",
      sku: "BMB-010",
      barcode: "899275931010",
      price: 11000,
      costPrice: 9000,
      stock: 30,
      minStock: 8,
      unit: "renceng",
      categoryId: catBumbu.id,
    },

    // --- 4. MIE & BAHAN MAKANAN ---
    {
      name: "Indomie Goreng Spesial 85g",
      sku: "MIE-001",
      barcode: "899886620001",
      price: 3500,
      costPrice: 2800,
      stock: 160,
      minStock: 30,
      unit: "bks",
      categoryId: catMie.id,
    },
    {
      name: "Indomie Soto Lamongan 80g",
      sku: "MIE-002",
      barcode: "899886620002",
      price: 3500,
      costPrice: 2800,
      stock: 120,
      minStock: 25,
      unit: "bks",
      categoryId: catMie.id,
    },
    {
      name: "Indomie Kari Ayam 72g",
      sku: "MIE-003",
      barcode: "899886620003",
      price: 3500,
      costPrice: 2800,
      stock: 100,
      minStock: 25,
      unit: "bks",
      categoryId: catMie.id,
    },
    {
      name: "Indomie Ayam Bawang 69g",
      sku: "MIE-004",
      barcode: "899886620004",
      price: 3500,
      costPrice: 2800,
      stock: 100,
      minStock: 25,
      unit: "bks",
      categoryId: catMie.id,
    },
    {
      name: "Mie Sedaap Goreng 90g",
      sku: "MIE-005",
      barcode: "899886620005",
      price: 3500,
      costPrice: 2800,
      stock: 120,
      minStock: 25,
      unit: "bks",
      categoryId: catMie.id,
    },
    {
      name: "Sarimi Isi 2 Ayam Kecap",
      sku: "MIE-006",
      barcode: "899886620006",
      price: 4500,
      costPrice: 3600,
      stock: 80,
      minStock: 20,
      unit: "bks",
      categoryId: catMie.id,
    },
    {
      name: "Bihun Jagung Cap Padamu 320g",
      sku: "MIE-007",
      barcode: "899886620007",
      price: 7500,
      costPrice: 5800,
      stock: 40,
      minStock: 10,
      unit: "bks",
      categoryId: catMie.id,
    },
    {
      name: "Soun Kaca Cap Naga 250g",
      sku: "MIE-008",
      barcode: "899886620008",
      price: 9000,
      costPrice: 7000,
      stock: 30,
      minStock: 8,
      unit: "bks",
      categoryId: catMie.id,
    },

    // --- 5. TELUR & OLAHAN SUSU ---
    {
      name: "Telur Ayam Negeri Segar 1kg",
      sku: "TLR-001",
      barcode: "8991005001",
      price: 29000,
      costPrice: 25500,
      stock: 40,
      minStock: 10,
      unit: "kg",
      categoryId: catTelur.id,
    },
    {
      name: "Telur Puyuh Mentah (Mika isi 30)",
      sku: "TLR-002",
      barcode: "8991005002",
      price: 14000,
      costPrice: 11000,
      stock: 20,
      minStock: 5,
      unit: "mika",
      categoryId: catTelur.id,
    },
    {
      name: "Susu Kental Manis Frisian Flag Putih 370g",
      sku: "TLR-003",
      barcode: "899275951003",
      price: 13000,
      costPrice: 11000,
      stock: 45,
      minStock: 12,
      unit: "kaleng",
      categoryId: catTelur.id,
    },
    {
      name: "Susu Kental Manis Frisian Flag Cokelat 370g",
      sku: "TLR-004",
      barcode: "899275951004",
      price: 13000,
      costPrice: 11000,
      stock: 40,
      minStock: 12,
      unit: "kaleng",
      categoryId: catTelur.id,
    },
    {
      name: "Susu UHT Ultra Milk Plain 1000ml",
      sku: "TLR-005",
      barcode: "899275951005",
      price: 20500,
      costPrice: 17500,
      stock: 30,
      minStock: 8,
      unit: "kotak",
      categoryId: catTelur.id,
    },
    {
      name: "Susu UHT Ultra Milk Cokelat 1000ml",
      sku: "TLR-006",
      barcode: "899275951006",
      price: 20500,
      costPrice: 17500,
      stock: 30,
      minStock: 8,
      unit: "kotak",
      categoryId: catTelur.id,
    },
    {
      name: "Keju Cheddar Kraft All In 1 165g",
      sku: "TLR-007",
      barcode: "899275951007",
      price: 15500,
      costPrice: 13000,
      stock: 25,
      minStock: 6,
      unit: "kotak",
      categoryId: catTelur.id,
    },

    // --- 6. KOPI, TEH & MINUMAN ---
    {
      name: "Kopi Kapal Api Spesial Mix (Renceng isi 10)",
      sku: "MNM-001",
      barcode: "899275961001",
      price: 15000,
      costPrice: 12500,
      stock: 35,
      minStock: 10,
      unit: "renceng",
      categoryId: catMinuman.id,
    },
    {
      name: "Kopi Good Day Cappuccino (Renceng isi 10)",
      sku: "MNM-002",
      barcode: "899275961002",
      price: 20000,
      costPrice: 17000,
      stock: 30,
      minStock: 8,
      unit: "renceng",
      categoryId: catMinuman.id,
    },
    {
      name: "Luwak White Koffie Original (Renceng isi 10)",
      sku: "MNM-003",
      barcode: "899275961003",
      price: 16500,
      costPrice: 13800,
      stock: 25,
      minStock: 8,
      unit: "renceng",
      categoryId: catMinuman.id,
    },
    {
      name: "Teh Celup SariWangi Asli Isi 25",
      sku: "MNM-004",
      barcode: "899999961004",
      price: 7500,
      costPrice: 6000,
      stock: 50,
      minStock: 15,
      unit: "kotak",
      categoryId: catMinuman.id,
    },
    {
      name: "Sirup Marjan Boudoin Cocopandan 460ml",
      sku: "MNM-005",
      barcode: "899275961005",
      price: 23500,
      costPrice: 20000,
      stock: 24,
      minStock: 6,
      unit: "botol",
      categoryId: catMinuman.id,
    },
    {
      name: "Air Mineral Aqua Botol 600ml",
      sku: "MNM-006",
      barcode: "899275961006",
      price: 4500,
      costPrice: 3200,
      stock: 72,
      minStock: 24,
      unit: "botol",
      categoryId: catMinuman.id,
    },
    {
      name: "Air Mineral Aqua Botol Besar 1500ml",
      sku: "MNM-007",
      barcode: "899275961007",
      price: 7500,
      costPrice: 5500,
      stock: 48,
      minStock: 12,
      unit: "botol",
      categoryId: catMinuman.id,
    },

    // --- 7. MAKANAN KALENG & OLAHAN ---
    {
      name: "Sarden ABC Saus Tomat 155g",
      sku: "KLG-001",
      barcode: "899275971001",
      price: 11500,
      costPrice: 9500,
      stock: 40,
      minStock: 10,
      unit: "kaleng",
      categoryId: catKaleng.id,
    },
    {
      name: "Sarden ABC Saus Cabai Ekstra Pedas 155g",
      sku: "KLG-002",
      barcode: "899275971002",
      price: 11500,
      costPrice: 9500,
      stock: 35,
      minStock: 10,
      unit: "kaleng",
      categoryId: catKaleng.id,
    },
    {
      name: "Kornet Sapi Pronas 198g",
      sku: "KLG-003",
      barcode: "899275971003",
      price: 24000,
      costPrice: 20500,
      stock: 20,
      minStock: 5,
      unit: "kaleng",
      categoryId: catKaleng.id,
    },

    // --- 8. SABUN & PEMBERSIH RUMAH ---
    {
      name: "Sunlight Pencuci Piring Jeruk Nipis 650ml",
      sku: "SBN-001",
      barcode: "899999981001",
      price: 14500,
      costPrice: 12000,
      stock: 40,
      minStock: 10,
      unit: "pouch",
      categoryId: catPembersih.id,
    },
    {
      name: "Mama Lemon Pencuci Piring Jeruk Nipis 680ml",
      sku: "SBN-002",
      barcode: "899999981002",
      price: 13500,
      costPrice: 11000,
      stock: 35,
      minStock: 10,
      unit: "pouch",
      categoryId: catPembersih.id,
    },
    {
      name: "Daia Deterjen Bubuk Bunga 850g",
      sku: "SBN-003",
      barcode: "899999981003",
      price: 19000,
      costPrice: 16000,
      stock: 30,
      minStock: 8,
      unit: "bks",
      categoryId: catPembersih.id,
    },
    {
      name: "Rinso Molto Deterjen Bubuk Anti Noda 770g",
      sku: "SBN-004",
      barcode: "899999981004",
      price: 22000,
      costPrice: 18500,
      stock: 25,
      minStock: 8,
      unit: "bks",
      categoryId: catPembersih.id,
    },
    {
      name: "Sabun Mandi Batang Lifebuoy Total 10 85g",
      sku: "SBN-005",
      barcode: "899999981005",
      price: 4500,
      costPrice: 3400,
      stock: 60,
      minStock: 15,
      unit: "pcs",
      categoryId: catPembersih.id,
    },
    {
      name: "Pasta Gigi Pepsodent Pencegah Gigi Berlubang 190g",
      sku: "SBN-006",
      barcode: "899999981006",
      price: 15000,
      costPrice: 12500,
      stock: 35,
      minStock: 10,
      unit: "kotak",
      categoryId: catPembersih.id,
    },

    // --- 9. GAS & KEPERLUAN RUMAH ---
    {
      name: "Gas LPG Melon 3kg (Isi Ulang)",
      sku: "GAS-001",
      barcode: "8991009001",
      price: 22000,
      costPrice: 19000,
      stock: 25,
      minStock: 8,
      unit: "tabung",
      categoryId: catGasLain.id,
    },
    {
      name: "Galon Air Mineral Aqua 19L (Refill)",
      sku: "GAS-002",
      barcode: "8991009002",
      price: 20000,
      costPrice: 16500,
      stock: 30,
      minStock: 10,
      unit: "galon",
      categoryId: catGasLain.id,
    },
    {
      name: "Korek Api Gas Roda Tokai",
      sku: "GAS-003",
      barcode: "8991009003",
      price: 3500,
      costPrice: 2200,
      stock: 50,
      minStock: 15,
      unit: "pcs",
      categoryId: catGasLain.id,
    },
    {
      name: "Obat Nyamuk Bakar Baygon Jumbo (Isi 10)",
      sku: "GAS-004",
      barcode: "8991009004",
      price: 6500,
      costPrice: 5000,
      stock: 35,
      minStock: 10,
      unit: "kotak",
      categoryId: catGasLain.id,
    },
  ];

  // Simpan semua produk dan catat log Stok Masuk awal
  console.log(`Menambahkan ${sembakoProducts.length} produk sembako ke katalog...`);
  for (const product of sembakoProducts) {
    const created = await prisma.product.create({ data: product });

    // Catat log stok masuk awal toko (IN)
    if (created.stock > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: created.id,
          type: "IN",
          quantity: created.stock,
          stockBefore: 0,
          stockAfter: created.stock,
          notes: "Penerimaan stok awal toko sembako",
          userId: owner.id,
        },
      });
    }
  }

  // Set Nama Toko ke 'Toko Sembako KasirKITA'
  await prisma.storeSetting.upsert({
    where: { id: "default" },
    update: {
      storeName: "Toko Sembako Berkah KasirKITA",
      receiptFooter: "Terima kasih telah berbelanja di Toko Sembako Berkah!",
    },
    create: {
      id: "default",
      storeName: "Toko Sembako Berkah KasirKITA",
      receiptFooter: "Terima kasih telah berbelanja di Toko Sembako Berkah!",
    },
  });

  console.log(`SUKSES:`);
  console.log(`- 0 Transaksi / Pesanan (Bersih total, siap jualan pertama)`);
  console.log(`- 0 Stok Keluar`);
  console.log(`- ${sembakoProducts.length} Produk Sembako Siap Jual`);
  console.log(`- 9 Kategori Sembako`);
  console.log(`- Semua riwayat stok masuk awal tercatat rapi di audit trail.`);
}

main()
  .catch((e) => {
    console.error("Gagal melakukan seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
