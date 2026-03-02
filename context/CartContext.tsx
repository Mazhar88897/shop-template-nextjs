 "use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type CartItem = {
  productId: string;
  quantity: number;
  name?: string;
  price?: string | number;
  imageUrl?: string;
};

type Cart = {
  items: CartItem[];
};

type CartContextValue = {
  cart: Cart;
  totalItems: number;
  addItem: (
    productId: string,
    quantity?: number,
    meta?: Omit<CartItem, "productId" | "quantity">
  ) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  getQuantity: (productId: string) => number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "shop-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>({ items: [] });
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.items)) {
          setCart({ items: parsed.items });
        }
      }
    } catch {
      // ignore hydration storage errors
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore write errors
    }
  }, [cart, isHydrated]);

  const value = useMemo<CartContextValue>(() => {
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    const addItem: CartContextValue["addItem"] = (
      productId,
      quantity = 1,
      meta
    ) => {
      if (!productId || quantity <= 0) return;
      setCart((prev) => {
        const existing = prev.items.find((i) => i.productId === productId);
        if (existing) {
          return {
            items: prev.items.map((i) =>
              i.productId === productId
                ? {
                    ...i,
                    quantity: i.quantity + quantity,
                    ...(meta ?? {}),
                  }
                : i
            ),
          };
        }
        return {
          items: [
            ...prev.items,
            {
              productId,
              quantity,
              ...(meta ?? {}),
            },
          ],
        };
      });
    };

    const updateQuantity: CartContextValue["updateQuantity"] = (
      productId,
      quantity
    ) => {
      setCart((prev) => {
        if (quantity <= 0) {
          return {
            items: prev.items.filter((i) => i.productId !== productId),
          };
        }
        return {
          items: prev.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        };
      });
    };

    const removeItem: CartContextValue["removeItem"] = (productId) => {
      setCart((prev) => ({
        items: prev.items.filter((i) => i.productId !== productId),
      }));
    };

    const getQuantity: CartContextValue["getQuantity"] = (productId) =>
      cart.items.find((i) => i.productId === productId)?.quantity ?? 0;

    return {
      cart,
      totalItems,
      addItem,
      updateQuantity,
      removeItem,
      getQuantity,
    };
  }, [cart]);

  if (!isHydrated) {
    return <>{children}</>;
  }

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    return {
      cart: { items: [] },
      totalItems: 0,
      addItem: () => {},
      updateQuantity: () => {},
      removeItem: () => {},
      getQuantity: () => 0,
    };
  }
  return ctx;
}

