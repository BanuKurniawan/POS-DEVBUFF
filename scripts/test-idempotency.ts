import { prisma } from "../src/lib/prisma";
import { addStock } from "../src/app/actions/stock";
import { processCheckout } from "../src/app/actions/checkout";

interface TestReport {
  name: string;
  passed: boolean;
  details: Record<string, unknown>;
  error?: string;
}

const reports: TestReport[] = [];

async function main() {
  console.log("===============================================================");
  console.log("🚀 STARTING AUTOMATED IDEMPOTENCY & CONCURRENCY TEST SUITE");
  console.log("===============================================================\n");

  // Setup: Find or create Category & User
  let category = await prisma.category.findFirst({ where: { slug: "test-category" } });
  if (!category) {
    category = await prisma.category.create({
      data: { name: "Test Category", slug: "test-category" },
    });
  }

  let user = await prisma.user.findFirst({ where: { email: "test-cashier@kasir.com" } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Test Cashier",
        email: "test-cashier@kasir.com",
        password: "dummypassword123",
        role: "KARYAWAN",
        isActive: true,
      },
    });
  }

  // Clean up any old test data and idempotency keys
  await prisma.idempotencyKey.deleteMany({
    where: { key: { startsWith: "test-" } },
  });
  await prisma.transactionItem.deleteMany({
    where: { product: { sku: { startsWith: "TEST-SKU-" } } },
  });
  await prisma.stockMovement.deleteMany({
    where: { product: { sku: { startsWith: "TEST-SKU-" } } },
  });
  await prisma.product.deleteMany({
    where: { sku: { startsWith: "TEST-SKU-" } },
  });

  // -------------------------------------------------------------
  // TEST 1: Normal stock addition
  // -------------------------------------------------------------
  console.log("▶ Running Test 1: Normal stock addition...");
  try {
    const prod1 = await prisma.product.create({
      data: {
        name: "Test Telur Ayam",
        sku: "TEST-SKU-1",
        price: 2500,
        costPrice: 2000,
        stock: 10,
        minStock: 5,
        unit: "butir",
        categoryId: category.id,
      },
    });

    const key1 = "test-key-stock-normal-01";
    const res1 = await addStock({
      productId: prod1.id,
      quantity: 10,
      notes: "Tambah stok pertama",
      userId: user.id,
      idempotencyKey: key1,
    });

    const refreshedProd1 = await prisma.product.findUniqueOrThrow({ where: { id: prod1.id } });
    const movements1 = await prisma.stockMovement.findMany({ where: { productId: prod1.id } });

    const passed =
      res1.success === true &&
      res1.isReplay !== true &&
      refreshedProd1.stock === 20 &&
      movements1.length === 1 &&
      movements1[0].quantity === 10;

    reports.push({
      name: "Test 1: Normal stock addition",
      passed,
      details: {
        initialStock: 10,
        quantityAdded: 10,
        finalStock: refreshedProd1.stock,
        movementsCreated: movements1.length,
        isReplay: res1.isReplay || false,
        message: res1.message,
      },
    });
    console.log(`  ✓ Test 1: ${passed ? "PASSED" : "FAILED"}\n`);
  } catch (err: unknown) {
    reports.push({
      name: "Test 1: Normal stock addition",
      passed: false,
      details: {},
      error: err instanceof Error ? err.message : String(err),
    });
    console.log("  ✗ Test 1 FAILED with exception:", err, "\n");
  }

  // -------------------------------------------------------------
  // TEST 2: Duplicate request with identical idempotency key and payload (sequential)
  // -------------------------------------------------------------
  console.log("▶ Running Test 2: Sequential duplicate request...");
  try {
    const prod2 = await prisma.product.findFirstOrThrow({ where: { sku: "TEST-SKU-1" } });
    const key2 = "test-key-stock-normal-01"; // Same key as Test 1!

    const res2 = await addStock({
      productId: prod2.id,
      quantity: 10,
      notes: "Tambah stok pertama",
      userId: user.id,
      idempotencyKey: key2,
    });

    const refreshedProd2 = await prisma.product.findUniqueOrThrow({ where: { id: prod2.id } });
    const movements2 = await prisma.stockMovement.findMany({ where: { productId: prod2.id } });

    const passed =
      res2.success === true &&
      res2.isReplay === true &&
      refreshedProd2.stock === 20 && // NOT 30!
      movements2.length === 1; // NOT 2!

    reports.push({
      name: "Test 2: Duplicate request with identical key & payload (sequential)",
      passed,
      details: {
        stockBeforeReplay: 20,
        finalStock: refreshedProd2.stock,
        movementsCount: movements2.length,
        isReplay: res2.isReplay,
        cacheHit: true,
        message: res2.message,
      },
    });
    console.log(`  ✓ Test 2: ${passed ? "PASSED" : "FAILED"}\n`);
  } catch (err: unknown) {
    reports.push({
      name: "Test 2: Duplicate request with identical key & payload (sequential)",
      passed: false,
      details: {},
      error: err instanceof Error ? err.message : String(err),
    });
    console.log("  ✗ Test 2 FAILED with exception:", err, "\n");
  }

  // -------------------------------------------------------------
  // TEST 3: Concurrent duplicate requests with the same key
  // -------------------------------------------------------------
  console.log("▶ Running Test 3: Concurrent duplicate requests with same key...");
  try {
    const prod3 = await prisma.product.create({
      data: {
        name: "Test Beras Premium",
        sku: "TEST-SKU-3",
        price: 15000,
        costPrice: 12000,
        stock: 20,
        minStock: 5,
        unit: "kg",
        categoryId: category.id,
      },
    });

    const key3 = "test-key-concurrent-dup-03";
    const concurrentCount = 5;

    // Dispatch 5 identical requests simultaneously
    const promises = Array.from({ length: concurrentCount }, () =>
      addStock({
        productId: prod3.id,
        quantity: 5,
        notes: "Concurrent batch input",
        userId: user.id,
        idempotencyKey: key3,
      })
    );

    const results = await Promise.all(promises);

    const refreshedProd3 = await prisma.product.findUniqueOrThrow({ where: { id: prod3.id } });
    const movements3 = await prisma.stockMovement.findMany({ where: { productId: prod3.id } });

    const allSuccessful = results.every((r) => r.success);
    const replayCount = results.filter((r) => r.isReplay).length;
    const freshCount = results.filter((r) => !r.isReplay).length;

    const passed =
      allSuccessful &&
      freshCount === 1 &&
      replayCount === concurrentCount - 1 &&
      refreshedProd3.stock === 25 && // 20 + 5 (NOT 20 + 25 = 45!)
      movements3.length === 1;

    reports.push({
      name: "Test 3: Concurrent duplicate requests with same key",
      passed,
      details: {
        concurrentRequests: concurrentCount,
        allSuccessful,
        freshCount,
        replayCount,
        initialStock: 20,
        finalStock: refreshedProd3.stock,
        movementsCreated: movements3.length,
      },
    });
    console.log(`  ✓ Test 3: ${passed ? "PASSED" : "FAILED"}\n`);
  } catch (err: unknown) {
    reports.push({
      name: "Test 3: Concurrent duplicate requests with same key",
      passed: false,
      details: {},
      error: err instanceof Error ? err.message : String(err),
    });
    console.log("  ✗ Test 3 FAILED with exception:", err, "\n");
  }

  // -------------------------------------------------------------
  // TEST 4: Independent concurrent transactions with distinct keys
  // -------------------------------------------------------------
  console.log("▶ Running Test 4: Independent concurrent transactions with distinct keys...");
  try {
    const prod4 = await prisma.product.create({
      data: {
        name: "Test Minyak Goreng",
        sku: "TEST-SKU-4",
        price: 18000,
        costPrice: 15000,
        stock: 10,
        minStock: 5,
        unit: "liter",
        categoryId: category.id,
      },
    });

    const key4A = "test-key-independent-4a";
    const key4B = "test-key-independent-4b";

    const [res4A, res4B] = await Promise.all([
      addStock({
        productId: prod4.id,
        quantity: 10,
        notes: "Input dari Admin A",
        userId: user.id,
        idempotencyKey: key4A,
      }),
      addStock({
        productId: prod4.id,
        quantity: 10,
        notes: "Input dari Admin B",
        userId: user.id,
        idempotencyKey: key4B,
      }),
    ]);

    const refreshedProd4 = await prisma.product.findUniqueOrThrow({ where: { id: prod4.id } });
    const movements4 = await prisma.stockMovement.findMany({ where: { productId: prod4.id } });

    const passed =
      res4A.success &&
      res4B.success &&
      refreshedProd4.stock === 30 && // 10 + 10 + 10
      movements4.length === 2;

    reports.push({
      name: "Test 4: Independent concurrent transactions with distinct keys",
      passed,
      details: {
        initialStock: 10,
        transactionA: "+10",
        transactionB: "+10",
        finalStock: refreshedProd4.stock,
        movementsCreated: movements4.length,
      },
    });
    console.log(`  ✓ Test 4: ${passed ? "PASSED" : "FAILED"}\n`);
  } catch (err: unknown) {
    reports.push({
      name: "Test 4: Independent concurrent transactions with distinct keys",
      passed: false,
      details: {},
      error: err instanceof Error ? err.message : String(err),
    });
    console.log("  ✗ Test 4 FAILED with exception:", err, "\n");
  }

  // -------------------------------------------------------------
  // TEST 5: Same idempotency key with different payload
  // -------------------------------------------------------------
  console.log("▶ Running Test 5: Same key with different payload...");
  try {
    const prod5 = await prisma.product.create({
      data: {
        name: "Test Gula Pasir",
        sku: "TEST-SKU-5",
        price: 16000,
        costPrice: 13000,
        stock: 50,
        minStock: 10,
        unit: "kg",
        categoryId: category.id,
      },
    });

    const key5 = "test-key-payload-mismatch-05";

    // 1st request: qty 5
    const res5A = await addStock({
      productId: prod5.id,
      quantity: 5,
      notes: "Original payload",
      userId: user.id,
      idempotencyKey: key5,
    });

    // 2nd request: same key, but qty 15 (different payload)
    const res5B = await addStock({
      productId: prod5.id,
      quantity: 15,
      notes: "Different payload",
      userId: user.id,
      idempotencyKey: key5,
    });

    const refreshedProd5 = await prisma.product.findUniqueOrThrow({ where: { id: prod5.id } });
    const movements5 = await prisma.stockMovement.findMany({ where: { productId: prod5.id } });

    const passed =
      res5A.success === true &&
      res5B.success === false &&
      (res5B.message.includes("Payload Mismatch") || res5B.message.includes("parameter berbeda")) &&
      refreshedProd5.stock === 55 && // only 1st succeeded (50 + 5)
      movements5.length === 1;

    reports.push({
      name: "Test 5: Same idempotency key with different payload",
      passed,
      details: {
        res5ASuccess: res5A.success,
        res5BSuccess: res5B.success,
        res5BMessage: res5B.message,
        finalStock: refreshedProd5.stock,
        movementsCreated: movements5.length,
      },
    });
    console.log(`  ✓ Test 5: ${passed ? "PASSED" : "FAILED"}\n`);
  } catch (err: unknown) {
    reports.push({
      name: "Test 5: Same idempotency key with different payload",
      passed: false,
      details: {},
      error: err instanceof Error ? err.message : String(err),
    });
    console.log("  ✗ Test 5 FAILED with exception:", err, "\n");
  }

  // -------------------------------------------------------------
  // TEST 6: Database transaction failure and rollback
  // -------------------------------------------------------------
  console.log("▶ Running Test 6: DB transaction failure & rollback...");
  try {
    const prod6 = await prisma.product.create({
      data: {
        name: "Test Garam Halus",
        sku: "TEST-SKU-6",
        price: 5000,
        costPrice: 3500,
        stock: 30,
        minStock: 5,
        unit: "bungkus",
        categoryId: category.id,
      },
    });

    const key6 = "test-key-failure-rollback-06";

    // 1st request: Invalid product ID to trigger rollback
    const res6A = await addStock({
      productId: "non-existent-product-id-9999",
      quantity: 10,
      notes: "Will fail",
      userId: user.id,
      idempotencyKey: key6,
    });

    // Check that idempotency key was rolled back (not left stuck in PROCESSING)
    const idempRecordAfterFail = await prisma.idempotencyKey.findUnique({
      where: { key: key6 },
    });

    // 2nd request: Retry with the SAME key and valid product ID
    const res6B = await addStock({
      productId: prod6.id,
      quantity: 10,
      notes: "Retry after fix",
      userId: user.id,
      idempotencyKey: key6,
    });

    const refreshedProd6 = await prisma.product.findUniqueOrThrow({ where: { id: prod6.id } });
    const movements6 = await prisma.stockMovement.findMany({ where: { productId: prod6.id } });

    const passed =
      res6A.success === false &&
      idempRecordAfterFail === null && // properly rolled back by MySQL transaction!
      res6B.success === true &&
      refreshedProd6.stock === 40 &&
      movements6.length === 1;

    reports.push({
      name: "Test 6: Database transaction failure and rollback",
      passed,
      details: {
        res6ASuccess: res6A.success,
        res6AMessage: res6A.message,
        idempotencyRolledBack: idempRecordAfterFail === null,
        retrySuccess: res6B.success,
        finalStock: refreshedProd6.stock,
      },
    });
    console.log(`  ✓ Test 6: ${passed ? "PASSED" : "FAILED"}\n`);
  } catch (err: unknown) {
    reports.push({
      name: "Test 6: Database transaction failure and rollback",
      passed: false,
      details: {},
      error: err instanceof Error ? err.message : String(err),
    });
    console.log("  ✗ Test 6 FAILED with exception:", err, "\n");
  }

  // -------------------------------------------------------------
  // TEST 7: Duplicate checkout requests
  // -------------------------------------------------------------
  console.log("▶ Running Test 7: Duplicate checkout requests...");
  try {
    const prod7 = await prisma.product.create({
      data: {
        name: "Test Teh Kotak",
        sku: "TEST-SKU-7",
        price: 4000,
        costPrice: 3000,
        stock: 50,
        minStock: 5,
        unit: "kotak",
        categoryId: category.id,
      },
    });

    const checkoutKey7 = "test-checkout-key-dup-07";

    // 1st Checkout
    const res7A = await processCheckout({
      items: [{ productId: prod7.id, quantity: 5 }],
      paymentMethod: "TUNAI",
      paidAmount: 25000,
      userId: user.id,
      idempotencyKey: checkoutKey7,
    });

    // 2nd Checkout: exact same request with same key
    const res7B = await processCheckout({
      items: [{ productId: prod7.id, quantity: 5 }],
      paymentMethod: "TUNAI",
      paidAmount: 25000,
      userId: user.id,
      idempotencyKey: checkoutKey7,
    });

    const refreshedProd7 = await prisma.product.findUniqueOrThrow({ where: { id: prod7.id } });
    const movements7 = await prisma.stockMovement.findMany({ where: { productId: prod7.id } });
    const transactions7 = await prisma.transaction.findMany({
      where: {
        items: { some: { productId: prod7.id } },
      },
    });

    const passed =
      res7A.success === true &&
      res7A.isReplay !== true &&
      res7B.success === true &&
      res7B.isReplay === true &&
      res7A.transaction?.invoiceNumber === res7B.transaction?.invoiceNumber &&
      refreshedProd7.stock === 45 && // Stock deducted ONCE (50 - 5 = 45, NOT 40!)
      transactions7.length === 1 && // Exactly 1 Transaction row created
      movements7.length === 1 && // Exactly 1 StockMovement OUT created
      movements7[0].type === "OUT";

    reports.push({
      name: "Test 7: Duplicate checkout requests",
      passed,
      details: {
        initialStock: 50,
        finalStock: refreshedProd7.stock,
        res7BIsReplay: res7B.isReplay,
        identicalInvoice: res7A.transaction?.invoiceNumber === res7B.transaction?.invoiceNumber,
        invoiceNumber: res7A.transaction?.invoiceNumber,
        transactionsCount: transactions7.length,
        stockMovementsOutCount: movements7.length,
      },
    });
    console.log(`  ✓ Test 7: ${passed ? "PASSED" : "FAILED"}\n`);
  } catch (err: unknown) {
    reports.push({
      name: "Test 7: Duplicate checkout requests",
      passed: false,
      details: {},
      error: err instanceof Error ? err.message : String(err),
    });
    console.log("  ✗ Test 7 FAILED with exception:", err, "\n");
  }

  // -------------------------------------------------------------
  // TEST 8: Concurrent independent checkout transactions
  // -------------------------------------------------------------
  console.log("▶ Running Test 8: Concurrent independent checkouts...");
  try {
    const prod8 = await prisma.product.create({
      data: {
        name: "Test Kopi Sachet",
        sku: "TEST-SKU-8",
        price: 2000,
        costPrice: 1500,
        stock: 20,
        minStock: 5,
        unit: "sachet",
        categoryId: category.id,
      },
    });

    const key8A = "test-checkout-concurrent-8a";
    const key8B = "test-checkout-concurrent-8b";

    // 2 Concurrent valid checkouts of 10 items each
    const [res8A, res8B] = await Promise.all([
      processCheckout({
        items: [{ productId: prod8.id, quantity: 10 }],
        paymentMethod: "TUNAI",
        paidAmount: 20000,
        userId: user.id,
        idempotencyKey: key8A,
      }),
      processCheckout({
        items: [{ productId: prod8.id, quantity: 10 }],
        paymentMethod: "TUNAI",
        paidAmount: 20000,
        userId: user.id,
        idempotencyKey: key8B,
      }),
    ]);

    const refreshedProd8Mid = await prisma.product.findUniqueOrThrow({ where: { id: prod8.id } });

    // Now try a 3rd checkout when stock is 0: should be rejected cleanly
    const key8C = "test-checkout-concurrent-8c";
    const res8C = await processCheckout({
      items: [{ productId: prod8.id, quantity: 5 }],
      paymentMethod: "TUNAI",
      paidAmount: 10000,
      userId: user.id,
      idempotencyKey: key8C,
    });

    const finalProd8 = await prisma.product.findUniqueOrThrow({ where: { id: prod8.id } });
    const transactions8 = await prisma.transaction.findMany({
      where: {
        items: { some: { productId: prod8.id } },
      },
    });

    const passed =
      res8A.success === true &&
      res8B.success === true &&
      refreshedProd8Mid.stock === 0 && // 20 - 10 - 10 = 0
      res8C.success === false && // Rejected due to stock exhaustion
      res8C.message.includes("tidak mencukupi") &&
      finalProd8.stock === 0 &&
      transactions8.length === 2 && // Only 2 successful transactions
      res8A.transaction?.invoiceNumber !== res8B.transaction?.invoiceNumber;

    reports.push({
      name: "Test 8: Concurrent independent checkout transactions",
      passed,
      details: {
        initialStock: 20,
        midStock: refreshedProd8Mid.stock,
        finalStock: finalProd8.stock,
        txASuccess: res8A.success,
        txBSuccess: res8B.success,
        txCSuccess: res8C.success,
        txCMessage: res8C.message,
        transactionsCount: transactions8.length,
        uniqueInvoices: [res8A.transaction?.invoiceNumber, res8B.transaction?.invoiceNumber],
      },
    });
    console.log(`  ✓ Test 8: ${passed ? "PASSED" : "FAILED"}\n`);
  } catch (err: unknown) {
    reports.push({
      name: "Test 8: Concurrent independent checkout transactions",
      passed: false,
      details: {},
      error: err instanceof Error ? err.message : String(err),
    });
    console.log("  ✗ Test 8 FAILED with exception:", err, "\n");
  }

  // -------------------------------------------------------------
  // SUMMARY REPORT
  // -------------------------------------------------------------
  console.log("===============================================================");
  console.log("📊 SUMMARY TEST REPORT");
  console.log("===============================================================");
  let allPassed = true;
  for (const rep of reports) {
    const icon = rep.passed ? "✅ PASS" : "❌ FAIL";
    console.log(`${icon} | ${rep.name}`);
    console.log(`   Details:`, JSON.stringify(rep.details));
    if (rep.error) console.log(`   Error: ${rep.error}`);
    if (!rep.passed) allPassed = false;
  }
  console.log("===============================================================");
  console.log(
    allPassed
      ? "🎉 ALL 8 TESTS PASSED SUCCESSFULLY!"
      : "⚠️ SOME TESTS FAILED. PLEASE CHECK LOGS."
  );
  console.log("===============================================================");

  // Teardown: Clean up test artifacts
  await prisma.idempotencyKey.deleteMany({
    where: { key: { startsWith: "test-" } },
  });
  await prisma.transactionItem.deleteMany({
    where: { product: { sku: { startsWith: "TEST-SKU-" } } },
  });
  await prisma.stockMovement.deleteMany({
    where: { product: { sku: { startsWith: "TEST-SKU-" } } },
  });
  await prisma.product.deleteMany({
    where: { sku: { startsWith: "TEST-SKU-" } },
  });
  await prisma.category.deleteMany({
    where: { slug: "test-category" },
  });
  await prisma.user.deleteMany({
    where: { email: "test-cashier@kasir.com" },
  });

  process.exit(allPassed ? 0 : 1);
}

main()
  .catch((e) => {
    console.error("Fatal error running test suite:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
