import {
  EMPTY_CUSTOMER,
  type CustomerForm,
} from "@/src/lib/validate-customer";
import { hapticSuccess } from "@/src/lib/haptics";
import { pulseCartBadge } from "@/src/cart/cart-badge-pulse";
import {
  addCartItem,
  cartItemCount,
  cartTotal,
  removeCartItem,
  setCartItemQuantity,
  type CartItem,
} from "@/src/cart/cart";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  total: number;
  customer: CustomerForm;
  addItem: (item: CartItem) => void;
  setQuantity: (beverageId: string, sizeId: string, quantity: number) => void;
  removeItem: (beverageId: string, sizeId: string) => void;
  updateCustomer: (customer: CustomerForm) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<CustomerForm>(EMPTY_CUSTOMER);

  const addItem = useCallback((item: CartItem) => {
    setItems((current) => addCartItem(current, item));
    pulseCartBadge();
    void hapticSuccess();
  }, []);

  const setQuantity = useCallback(
    (beverageId: string, sizeId: string, quantity: number) => {
      setItems((current) =>
        setCartItemQuantity(current, beverageId, sizeId, quantity),
      );
    },
    [],
  );

  const removeItem = useCallback((beverageId: string, sizeId: string) => {
    setItems((current) => removeCartItem(current, beverageId, sizeId));
  }, []);

  const updateCustomer = useCallback((next: CustomerForm) => {
    setCustomer(next);
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCustomer(EMPTY_CUSTOMER);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount: cartItemCount(items),
      total: cartTotal(items),
      addItem,
      setQuantity,
      removeItem,
      customer,
      updateCustomer,
      clearCart,
    }),
    [items, addItem, setQuantity, removeItem, customer, updateCustomer, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
