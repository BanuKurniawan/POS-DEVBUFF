export interface ReceiptData {
  storeName: string;
  storeAddress?: string | null;
  storePhone?: string | null;
  receiptFooter?: string | null;
  invoiceNumber: string;
  createdAt: Date | string;
  cashierName?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  discount: number;
  tax: number;
  taxPercent?: number;
  finalAmount: number;
  paymentMethod: string;
  paidAmount: number;
  changeAmount: number;
}

export function formatWhatsAppReceiptText(data: ReceiptData): string {
  const d = typeof data.createdAt === "string" ? new Date(data.createdAt) : data.createdAt;
  const dateStr = d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const timeStr = d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const storeHeader = `*${(data.storeName || "KASIRKITA").toUpperCase()}*\n${data.storeAddress || ""}\nTelp/WA: ${
    data.storePhone || "-"
  }\n================================`;

  const invoiceInfo = `Tgl : ${dateStr} ${timeStr}\nNo. Struk : ${data.invoiceNumber}\nKasir : ${
    data.cashierName || "Kasir"
  }\n--------------------------------`;

  const itemsList = data.items
    .map(
      (i) =>
        `*${i.name}*\n  ${i.quantity}x Rp ${i.price.toLocaleString("id-ID")} = Rp ${i.subtotal.toLocaleString("id-ID")}`
    )
    .join("\n");

  const totalItemsCount = data.items.reduce((s, i) => s + i.quantity, 0);

  const summary = `--------------------------------\nTotal Item : ${totalItemsCount} barang${
    data.discount > 0 ? `\nDiskon     : -Rp ${data.discount.toLocaleString("id-ID")}` : ""
  }${data.tax > 0 ? `\nPPN        : +Rp ${data.tax.toLocaleString("id-ID")}` : ""}\nTotal Belanja : Rp ${data.finalAmount.toLocaleString(
    "id-ID"
  )}\nMetode Bayar : ${data.paymentMethod}${
    data.paymentMethod === "TUNAI"
      ? `\nUang Diterima: Rp ${data.paidAmount.toLocaleString("id-ID")}\nKembalian    : Rp ${data.changeAmount.toLocaleString("id-ID")}`
      : ""
  }\nStatus       : LUNAS\n================================\n_Barang yang sudah dibeli tidak dapat ditukar atau dikembalikan._\n\n*TERIMA KASIH*\n_Selamat Berbelanja Kembali_\n${
    data.receiptFooter || ""
  }`;

  return `${storeHeader}\n${invoiceInfo}\n${itemsList}\n${summary}`;
}

export function getWhatsAppShareUrl(data: ReceiptData, customerPhone?: string): string {
  const fullText = formatWhatsAppReceiptText(data);
  let cleanPhone = (customerPhone || "").replace(/[^0-9]/g, "");
  if (cleanPhone.startsWith("0")) {
    cleanPhone = "62" + cleanPhone.slice(1);
  } else if (cleanPhone.startsWith("8")) {
    cleanPhone = "62" + cleanPhone;
  }

  if (cleanPhone.length >= 8) {
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(fullText)}`;
  }
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(fullText)}`;
}

export function getPaymentMethodLabel(method: string): string {
  switch (method) {
    case "QRIS":
      return "QRIS (Digital)";
    case "TRANSFER":
      return "Transfer Bank";
    case "DEBIT":
      return "Kartu Debit / EDC";
    case "TUNAI":
    default:
      return "Tunai";
  }
}
