import { ProductDTO } from "./product";
import { PaymentMethodType } from "./transaction";

export interface CartItem extends ProductDTO {
  quantity: number;
  itemNote?: string;
}

export interface HeldTransaction {
  id: string;
  label: string;
  createdAt: string;
  cart: CartItem[];
  paymentMethod: PaymentMethodType;
  discountPercent: number;
  taxPercent: number;
  enableTax: boolean;
  totalAmount: number;
}

export type PaymentMethod = PaymentMethodType;

