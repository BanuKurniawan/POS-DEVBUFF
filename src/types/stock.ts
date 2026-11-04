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

export interface CreateStockInInput {
  productId: string;
  quantity: number;
  notes?: string;
  userId?: string;
  idempotencyKey?: string;
}

