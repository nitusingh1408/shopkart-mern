
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";

import api from "../services/api";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshCart = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/cart");
      setCartItems(response.data.cart || []);
    } catch (err) {
      setCartItems([]);

      if (err.response?.status !== 401) {
        setError("Unable to load your cart.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId) => {
    const response = await api.post(`/cart/${productId}`);
    setCartItems(response.data.cart || []);
    setError("");
    return response.data;
  };

  const updateQuantity = async (productId, quantity) => {
    const response = await api.patch(`/cart/${productId}`, {
      quantity
    });

    setCartItems(response.data.cart || []);
    setError("");
    return response.data;
  };

  const removeFromCart = async (productId) => {
    const response = await api.delete(`/cart/${productId}`);

    setCartItems(response.data.cart || []);
    setError("");
    return response.data;
  };

  const clearCart = () => {
    setCartItems([]);
    setError("");
  };

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const subtotal = cartItems.reduce(
    (total, item) =>
      total + (item.product?.price || 0) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        error,
        cartCount,
        subtotal,
        refreshCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}