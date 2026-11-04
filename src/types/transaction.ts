export type PaymentMethodType = "TUNAI" | "QRIS" | "DEBIT" | "TRANSFER";

export interface CheckoutItemInput {
  productId: string;
  quantity: number;
}

export interface CheckoutRequest {
  items: CheckoutItemInput[];
  paymentMethod: PaymentMethodType;
  paidAmount: number;
  discountPercent?: number;
  taxPercent?: number;
  notes?: string;
  userId?: string;
  idempotencyKey?: string;
}

export interface TransactionItemDTO {
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface TransactionSummaryDTO {
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
  items: TransactionItemDTO[];
}

export interface CheckoutResponse {
  success: boolean;
  message: string;
  transaction?: TransactionSummaryDTO;
  isReplay?: boolean;
}

export interface TransactionRecordDTO {
  id: string;
  invoiceNumber: string;
  createdAt: Date;
  finalAmount: number;
  totalAmount: number;
  discount: number;
  tax: number;
  paidAmount: number;
  changeAmount: number;
  paymentMethod: string;
  status: string;
  userName: string;
  itemCount: number;
  items?: {
    id: string;
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
  }[];
}

