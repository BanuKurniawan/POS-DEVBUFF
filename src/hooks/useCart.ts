import { useState, useMemo, useCallback } from "react";
import { CartItem, PaymentMethod, ProductDTO } from "@/types";

interface UseCartOptions {
  onSoundBeep?: (freq?: number, duration?: number) => void;
}

export function useCart(options?: UseCartOptions) {
  const { onSoundBeep } = options || {};

  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("TUNAI");
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [customDiscountRp, setCustomDiscountRp] = useState<number>(0);
  const [enableTax, setEnableTax] = useState<boolean>(false);
  const [taxPercent, setTaxPercent] = useState<number>(11);
  const [customerOrderNote, setCustomerOrderNote] = useState<string>("Pelanggan Umum");

  // Calculations
  const totalCartItems = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (customDiscountRp > 0) return Math.min(subtotal, customDiscountRp);
    return Math.round((subtotal * discountPercent) / 100);
  }, [subtotal, discountPercent, customDiscountRp]);

  const taxAmount = useMemo(() => {
    if (!enableTax) return 0;
    const afterDiscount = Math.max(0, subtotal - discountAmount);
    return Math.round((afterDiscount * taxPercent) / 100);
  }, [subtotal, discountAmount, enableTax, taxPercent]);

  const finalTotal = useMemo(() => {
    return Math.max(0, subtotal - discountAmount + taxAmount);
  }, [subtotal, discountAmount, taxAmount]);

  const effectiveCashGiven = useMemo(() => {
    return paymentMethod === "TUNAI" ? cashGiven : finalTotal;
  }, [paymentMethod, cashGiven, finalTotal]);

  const changeAmount = useMemo(() => {
    if (paymentMethod !== "TUNAI") return 0;
    return Math.max(0, cashGiven - finalTotal);
  }, [paymentMethod, cashGiven, finalTotal]);

  const isPaymentValid = useMemo(() => {
    if (cart.length === 0) return false;
    if (!paymentMethod) return false;
    if (paymentMethod !== "TUNAI") return finalTotal > 0;
    if (!cashGiven || cashGiven <= 0) return false;
    return cashGiven >= finalTotal;
  }, [cart, paymentMethod, cashGiven, finalTotal]);

  // Actions
  const addToCart = useCallback(
    (product: ProductDTO) => {
      if (product.stock <= 0) return;
      onSoundBeep?.(980, 0.06);

      setCart((prev) => {
        const existing = prev.find((item) => item.id === product.id);
        if (existing) {
          if (existing.quantity >= product.stock) return prev;
          return prev.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [...prev, { ...product, quantity: 1 }];
      });
    },
    [onSoundBeep]
  );

  const updateQuantity = useCallback(
    (id: string, delta: number) => {
      onSoundBeep?.(820, 0.05);
      setCart((prev) =>
        prev
          .map((item) => {
            if (item.id === id) {
              const newQty = item.quantity + delta;
              if (newQty <= 0) return null;
              if (newQty > item.stock) return item;
              return { ...item, quantity: newQty };
            }
            return item;
          })
          .filter(Boolean) as CartItem[]
      );
    },
    [onSoundBeep]
  );

  const updateItemNote = useCallback((id: string, note: string) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, itemNote: note } : item))
    );
  }, []);

  const removeFromCart = useCallback(
    (id: string) => {
      onSoundBeep?.(520, 0.08);
      setCart((prev) => prev.filter((item) => item.id !== id));
    },
    [onSoundBeep]
  );

  const clearCart = useCallback(() => {
    setCart([]);
    setCashGiven(0);
    setDiscountPercent(0);
    setCustomDiscountRp(0);
    setCustomerOrderNote("Pelanggan Umum");
  }, []);

  return {
    cart,
    setCart,
    paymentMethod,
    setPaymentMethod,
    cashGiven,
    setCashGiven,
    discountPercent,
    setDiscountPercent,
    customDiscountRp,
    setCustomDiscountRp,
    enableTax,
    setEnableTax,
    taxPercent,
    setTaxPercent,
    customerOrderNote,
    setCustomerOrderNote,
    // Derived
    totalCartItems,
    subtotal,
    discountAmount,
    taxAmount,
    finalTotal,
    effectiveCashGiven,
    changeAmount,
    isPaymentValid,
    // Operations
    addToCart,
    updateQuantity,
    updateItemNote,
    removeFromCart,
    clearCart,
  };
}

