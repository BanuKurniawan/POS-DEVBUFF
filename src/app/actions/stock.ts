"use server";

import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  executeIdempotentTransaction,
  IdempotencyError,
  PayloadMismatchError,
  ConcurrentProcessingError,
} from "@/lib/idempotency";

export interface StockMovementDTO {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  unit: string;
  type: "IN" | "OUT";
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  notes: string | null;
  userName: string;
  createdAt: Date;
}

export interface ProductStockSelectDTO {
  id: string;
  name: string;
  sku: string;
  stock: number;
  minStock: number;
  unit: string;
  price: number;
  costPrice: number;
  category: string;
}

// 1. Ambil data produk aktif untuk dropdown form stok masuk
export async function getProductsForStockSelect(): Promise<ProductStockSelectDTO[]> {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { name: "asc" },
    });

    return products.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      stock: p.stock,
      minStock: p.minStock ?? 5,
      unit: p.unit,
      price: Number(p.price),
      costPrice: Number(p.costPrice),
      category: p.category?.name || "Umum",
    }));
  } catch (error) {
    console.warn("Database offline or fallback:", error);
    return [];
  }
}

// 2. Ambil riwayat pergerakan stok (Stok Masuk & Keluar)
export async function getStockMovements(filters?: {
  productId?: string;
  type?: "ALL" | "IN" | "OUT";
  limit?: number;
}): Promise<StockMovementDTO[]> {
  try {
    const whereClause: {
      productId?: string;
      type?: "IN" | "OUT";
    } = {};

    if (filters?.productId && filters.productId !== "all") {
      whereClause.productId = filters.productId;
    }

    if (filters?.type && filters.type !== "ALL") {
      whereClause.type = filters.type;
    }

    const movements = await prisma.stockMovement.findMany({
      where: whereClause,
      include: {
        product: true,
        user: true,
      },
      orderBy: { createdAt: "desc" },
      take: filters?.limit || 100,
    });

    return movements.map((m) => ({
      id: m.id,
      productId: m.productId,
      productName: m.product?.name || "Produk Dihapus",
      sku: m.product?.sku || "-",
      unit: m.product?.unit || "pcs",
      type: m.type as "IN" | "OUT",
      quantity: m.quantity,
      stockBefore: m.stockBefore,
      stockAfter: m.stockAfter,
      notes: m.notes,
      userName: m.user?.name || "Sistem / Kasir",
      createdAt: m.createdAt,
    }));
  } catch (error) {
    console.warn("Database offline or fallback:", error);
    return [];
  }
}

// 3. Tambah Stok Masuk (Bisa dilakukan oleh OWNER maupun KARYAWAN)
export interface AddStockInput {
  productId: string;
  quantity: number;
  notes?: string;
  userId?: string;
  idempotencyKey?: string;
}

export async function addStock(
  input: AddStockInput
): Promise<{ success: boolean; message: string; updatedStock?: number; isReplay?: boolean }> {
  try {
    const qty = Number(input.quantity);
    if (!input.productId) {
      return { success: false, message: "Pilih produk terlebih dahulu." };
    }

    if (!qty || qty <= 0) {
      return { success: false, message: "Jumlah barang masuk minimal 1." };
    }

    const idempotencyKey = input.idempotencyKey?.trim() || crypto.randomUUID();
    const payloadToHash = {
      productId: input.productId,
      quantity: qty,
      notes: input.notes?.trim() || "",
    };

    const { response, isReplay } = await executeIdempotentTransaction({
      key: idempotencyKey,
      scope: "STOCK_IN",
      payload: payloadToHash,
      execute: async (tx) => {
        const product = await tx.product.findUnique({
          where: { id: input.productId },
        });

        if (!product) {
          throw new Error("Produk tidak ditemukan di database.");
        }

        // Validasi userId
        let validUserId: string | null = null;
        if (input.userId) {
          const user = await tx.user.findFirst({
            where: {
              OR: [{ id: input.userId }, { email: input.userId }],
            },
          });
          if (user) validUserId = user.id;
        }

        if (!validUserId) {
          const fallbackUser = await tx.user.findFirst({ where: { isActive: true } });
          validUserId = fallbackUser ? fallbackUser.id : null;
        }

        const stockBefore = product.stock;
        const stockAfter = stockBefore + qty;

        // Update stok produk
        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: {
              increment: qty,
            },
          },
        });

        // Catat pergerakan stok masuk
        await tx.stockMovement.create({
          data: {
            productId: product.id,
            type: "IN",
            quantity: qty,
            stockBefore,
            stockAfter,
            notes: input.notes?.trim() || "Penerimaan stok barang masuk",
            userId: validUserId,
          },
        });

        return {
          productName: product.name,
          newStock: stockAfter,
          unit: product.unit,
        };
      },
    });

    if (!isReplay) {
      try {
        revalidatePath("/stock-in");
        revalidatePath("/products");
        revalidatePath("/pos");
        revalidatePath("/dashboard");
      } catch {
        // Safe fallback when executed outside Next.js request lifecycle (e.g. scripts/tests)
      }
    }

    return {
      success: true,
      message: isReplay
        ? `[Replay Transaksi] Data stok sudah tercatat sebelumnya. Total stok saat transaksi: ${response.newStock} ${response.unit}.`
        : `Berhasil menambahkan ${qty} ${response.unit} ke ${response.productName}. Total stok sekarang: ${response.newStock} ${response.unit}.`,
      updatedStock: response.newStock,
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

    const message = error instanceof Error ? error.message : "Gagal menambahkan stok barang.";
    return {
      success: false,
      message,
    };
  }
}

