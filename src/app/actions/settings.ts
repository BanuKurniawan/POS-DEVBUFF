"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface StoreSettingDTO {
  id: string;
  storeName: string;
  address: string;
  phoneNumber: string;
  logoUrl: string;
  receiptFooter: string;
}

export async function getStoreSetting(): Promise<StoreSettingDTO> {
  try {
    let setting = await prisma.storeSetting.findUnique({
      where: { id: "default" },
    });

    if (!setting) {
      setting = await prisma.storeSetting.create({
        data: {
          id: "default",
          storeName: "Toko Berkah UMKM",
          address: "Jl. Gatot Subroto No. 42, Jakarta",
          phoneNumber: "0812-3456-7890",
          logoUrl: null,
          receiptFooter: "Terima kasih atas kunjungan Anda!",
        },
      });
    }

    return {
      id: setting.id,
      storeName: setting.storeName,
      address: setting.address || "",
      phoneNumber: setting.phoneNumber || "",
      logoUrl: setting.logoUrl || "",
      receiptFooter: setting.receiptFooter || "Terima kasih atas kunjungan Anda!",
    };
  } catch (error) {
    console.warn("Using fallback store setting:", error);
    return {
      id: "default",
      storeName: "Toko Berkah UMKM",
      address: "Jl. Gatot Subroto No. 42, Jakarta",
      phoneNumber: "0812-3456-7890",
      logoUrl: "",
      receiptFooter: "Terima kasih atas kunjungan Anda!",
    };
  }
}

export async function updateStoreSetting(data: {
  storeName: string;
  address: string;
  phoneNumber: string;
  logoUrl?: string;
  receiptFooter: string;
}): Promise<{ success: boolean; message: string; setting?: StoreSettingDTO }> {
  try {
    const updateData: Prisma.StoreSettingUpdateInput = {
      storeName: data.storeName.trim() || "Toko Saya",
      address: data.address.trim() || null,
      phoneNumber: data.phoneNumber.trim() || null,
      receiptFooter: data.receiptFooter.trim() || "Terima kasih atas kunjungan Anda!",
    };

    // Hanya update logoUrl jika dikirim dari client (setelah upload berhasil)
    if (data.logoUrl !== undefined) {
      updateData.logoUrl = data.logoUrl.trim() || null;
    }

    const updated = await prisma.storeSetting.upsert({
      where: { id: "default" },
      update: updateData,
      create: {
        id: "default",
        storeName: updateData.storeName as string,
        address: (updateData.address as string) || null,
        phoneNumber: (updateData.phoneNumber as string) || null,
        logoUrl: (updateData.logoUrl as string) || null,
        receiptFooter: (updateData.receiptFooter as string) || null,
      },
    });

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    revalidatePath("/pos");

    return {
      success: true,
      message: "Pengaturan toko berhasil disimpan ke database!",
      setting: {
        id: updated.id,
        storeName: updated.storeName,
        address: updated.address || "",
        phoneNumber: updated.phoneNumber || "",
        logoUrl: updated.logoUrl || "",
        receiptFooter: updated.receiptFooter || "Terima kasih atas kunjungan Anda!",
      },
    };
  } catch (error: unknown) {
    console.error("Failed to update store settings:", error);
    const message = error instanceof Error ? error.message : "Gagal menyimpan pengaturan toko.";
    return {
      success: false,
      message,
    };
  }
}
