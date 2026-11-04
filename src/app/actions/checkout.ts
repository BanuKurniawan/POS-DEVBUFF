"use server";

import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  executeIdempotentTransaction,
  IdempotencyError,
  PayloadMismatchError,
  ConcurrentProcessingError,
} from "@/lib/idempotency";

export interface CheckoutItemInput {
  productId: string;
  quantity: number;
}

export interface CheckoutRequest {
  items: CheckoutItemInput[];
  paymentMethod: "TUNAI" | "QRIS" | "DEBIT" | "TRANSFER";
  paidAmount: number;
  discountPercent?: number;
  taxPercent?: number;
  notes?: string;
  userId?: string;
  idempotencyKey?: string;
}

export interface CheckoutResponse {
  success: boolean;
  message: string;
  transaction?: {
    id: string;
    invoiceNumber: string;
    totalAmount: number;
    discount: number;
    tax: number;
    finalAmount: number;
    paidAmount: number;
    changeAmount: number;
    paymentMethod: string;
    createdAt: Date;
    items: {
      name: string;
      quantity: number;
      price: number;
      subtotal: number;
    }[];
  };
  isReplay?: boolean;
}

export async function processCheckout(data: CheckoutRequest): Promise<CheckoutResponse> {
  try {
    if (!data.items || data.items.length === 0) {
      return { success: false, message: "Keranjang belanja kosong. Pilih produk terlebih dahulu." };
    }

    if (!data.paymentMethod) {
      return { success: false, message: "Wajib memilih jenis metode pembayaran (Tunai, QRIS, Debit, atau Transfer)." };
    }

    if (data.paidAmount === undefined || data.paidAmount === null || data.paidAmount <= 0) {
      return { success: false, message: "Wajib memasukkan nominal uang yang diterima dari pembeli." };
    }

    const idempotencyKey = data.idempotencyKey?.trim() || crypto.randomUUID();

    const normalizedItems = data.items
      .map((i) => ({
        productId: i.productId,
        quantity: Number(i.quantity),
      }))
      .sort((a, b) => a.productId.localeCompare(b.productId));

    const payloadToHash = {
      items: normalizedItems,
      paymentMethod: data.paymentMethod,
      paidAmount: Number(data.paidAmount),
      discountPercent: data.discountPercent || 0,
      taxPercent: data.taxPercent || 0,
    };

    const { response, isReplay } = await executeIdempotentTransaction({
      key: idempotencyKey,
      scope: "CHECKOUT",
      payload: payloadToHash,
      execute: async (tx: Prisma.TransactionClient) => {
        // 1. Ambil data produk terbaru dari database untuk verifikasi harga dan stok
        const productIds = data.items.map((i: CheckoutItemInput) => i.productId);
        const dbProducts = await tx.product.findMany({
          where: { id: { in: productIds } },
        });

        const productMap = new Map(
          dbProducts.map((p) => [p.id, p])
        );

        let subtotal = 0;
        const orderItemsToCreate: {
          productId: string;
          productName: string;
          priceAtPurchase: number;
          quantity: number;
          subtotal: number;
        }[] = [];

        for (const item of data.items) {
          const product = productMap.get(item.productId);

          if (!product) {
            throw new Error(`Produk dengan ID ${item.productId} tidak ditemukan.`);
          }

          if (product.stock < item.quantity) {
            throw new Error(
              `Stok untuk "${product.name}" tidak mencukupi. Sisa stok: ${product.stock} ${product.unit}.`
            );
          }

          const priceNumber = Number(product.price);
          const itemSubtotal = priceNumber * item.quantity;
          subtotal += itemSubtotal;

          orderItemsToCreate.push({
            productId: product.id,
            productName: product.name,
            priceAtPurchase: priceNumber,
            quantity: item.quantity,
            subtotal: itemSubtotal,
          });

          // 2. Kurangi stok produk secara langsung
          await tx.product.update({
            where: { id: product.id },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }

        // 3. Kalkulasi Diskon, Pajak, Total Akhir, dan Kembalian
        const discountRate = data.discountPercent || 0;
        const discount = Math.round((subtotal * discountRate) / 100);
        const afterDiscount = subtotal - discount;
        const taxRate = typeof data.taxPercent === "number" ? Math.max(0, data.taxPercent) : 0;
        const tax = taxRate > 0 ? Math.round((afterDiscount * taxRate) / 100) : 0;
        const finalAmount = Math.max(0, afterDiscount + tax);

        const paidAmount = Number(data.paidAmount);

        if (paidAmount < finalAmount) {
          throw new Error(
            `Nominal uang yang diterima kurang. Total tagihan Rp ${finalAmount.toLocaleString("id-ID")}, uang diterima Rp ${paidAmount.toLocaleString("id-ID")}`
          );
        }

        const changeAmount = Math.max(0, paidAmount - finalAmount);

        // 4. Generate Nomor Invoice (Format: INV-YYYYMMDD-RANDOM)
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const invoiceNumber = `INV-${dateStr}-${randomSuffix}`;

        // Mapping Enum PaymentMethod
        let mappedMethod: "TUNAI" | "QRIS" | "DEBIT" | "TRANSFER" = "TUNAI";
        if (data.paymentMethod === "QRIS") mappedMethod = "QRIS";
        if (data.paymentMethod === "DEBIT") mappedMethod = "DEBIT";
        if (data.paymentMethod === "TRANSFER") mappedMethod = "TRANSFER";

        // 5. Validasi userId terhadap database agar Foreign Key constraint tidak gagal
        let validUserId: string | null = null;
        if (data.userId) {
          const foundById = await tx.user.findUnique({ where: { id: data.userId } });
          if (foundById) {
            validUserId = foundById.id;
          } else {
            const foundByEmail = await tx.user.findFirst({
              where: {
                OR: [{ email: data.userId }, { email: "kasir@kasir.com" }, { email: "owner@kasir.com" }],
              },
            });
            if (foundByEmail) validUserId = foundByEmail.id;
          }
        }

        // Jika belum ditemukan, gunakan user aktif pertama di sistem
        if (!validUserId) {
          const fallbackUser = await tx.user.findFirst({ where: { isActive: true } });
          validUserId = fallbackUser ? fallbackUser.id : null;
        }

        // 6. Buat Record Transaksi Beserta Items
        const createdTransaction = await tx.transaction.create({
          data: {
            invoiceNumber,
            totalAmount: subtotal,
            discount,
            tax,
            finalAmount,
            paidAmount,
            changeAmount,
            paymentMethod: mappedMethod,
            status: "COMPLETED",
            notes: data.notes || null,
            userId: validUserId,
            items: {
              create: orderItemsToCreate.map((item) => ({
                productId: item.productId,
                productName: item.productName,
                priceAtPurchase: item.priceAtPurchase,
                quantity: item.quantity,
                subtotal: item.subtotal,
              })),
            },
          },
          include: {
            items: true,
          },
        });

        // 7. Catat Riwayat Pergerakan Stok Keluar (StockMovement OUT)
        for (const item of data.items) {
          const product = productMap.get(item.productId);
          if (product) {
            await tx.stockMovement.create({
              data: {
                productId: product.id,
                type: "OUT",
                quantity: item.quantity,
                stockBefore: product.stock,
                stockAfter: Math.max(0, product.stock - item.quantity),
                notes: `Penjualan POS (${invoiceNumber})`,
                userId: validUserId,
              },
            });
          }
        }

        return {
          id: createdTransaction.id,
          invoiceNumber: createdTransaction.invoiceNumber,
          totalAmount: subtotal,
          discount,
          tax,
          finalAmount,
          paidAmount,
          changeAmount,
          paymentMethod: createdTransaction.paymentMethod,
          createdAt: createdTransaction.createdAt,
          items: createdTransaction.items.map((i: (typeof createdTransaction.items)[number]) => ({
            name: i.productName,
            quantity: i.quantity,
            price: Number(i.priceAtPurchase),
            subtotal: Number(i.subtotal),
          })),
        };
      },
    });

    return {
      success: true,
      message: isReplay
        ? `[Replay Transaksi] Transaksi telah berhasil diproses sebelumnya (${response.invoiceNumber}).`
        : "Transaksi berhasil diproses dan dicatat ke database.",
      transaction: response,
      isReplay,
    };
  } catch (error: unknown) {
    if (
      error instanceof PayloadMismatchError ||
      error instanceof ConcurrentProcessingError ||
      error instanceof IdempotencyError
    ) {
      return {
        success: false,
        message: error.message,
      };
    }

    console.error("Checkout transaction error:", error);
    const message = error instanceof Error ? error.message : "Terjadi kesalahan saat memproses transaksi.";
    return {
      success: false,
      message,
    };
  }
}