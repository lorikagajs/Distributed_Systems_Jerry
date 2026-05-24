import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getCart } from '../api/cart';
import type { Cart } from '../types';
import { useAuth } from './AuthContext';
import { useTenant } from './TenantContext';

function computeCartCount(cart: Cart | null): number {
  if (!cart) return 0;
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

interface CartContextType {
  cartCount: number;
  refreshCart: () => Promise<void>;
  syncCartCount: (cart: Cart) => void;
  clearCartContext: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const { tenant } = useTenant();
  const [cartCount, setCartCount] = useState(0);

  const clearCartContext = useCallback(() => {
    setCartCount(0);
  }, []);

  const syncCartCount = useCallback((cart: Cart) => {
    setCartCount(computeCartCount(cart));
  }, []);

  const refreshCart = useCallback(async () => {
    if (!token || !tenant?.tenantId) {
      setCartCount(0);
      return;
    }

    try {
      const cart = await getCart();
      setCartCount(computeCartCount(cart));
    } catch {
      setCartCount(0);
    }
  }, [token, tenant?.tenantId]);

  useEffect(() => {
    void refreshCart();
  }, [refreshCart]);

  const value = useMemo(
    () => ({
      cartCount,
      refreshCart,
      syncCartCount,
      clearCartContext,
    }),
    [cartCount, refreshCart, syncCartCount, clearCartContext],
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
