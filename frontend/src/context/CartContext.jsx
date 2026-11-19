import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../api/cartApi";

import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();

  const [cart, setCart] = useState({
    items: [],
  });

  const [loading, setLoading] = useState(false);

  // Fetch cart when the authenticated user changes
  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        setCart({ items: [] });
        return;
      }

      try {
        setLoading(true);

        const response = await getCart();

        setCart(response.data.cart);
      } catch (error) {
        console.error("Failed to fetch cart:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user]);

  // Add product to cart
  const addProductToCart = async (productId, quantity = 1) => {
    const response = await addToCart(productId, quantity);

    setCart(response.data.cart);

    return response;
  };

  // Update cart item quantity
  const changeCartItemQuantity = async (productId, quantity) => {
    const response = await updateCartItem(productId, quantity);

    setCart(response.data.cart);

    return response;
  };

  // Remove product from cart
  const deleteCartItem = async (productId) => {
    const response = await removeCartItem(productId);

    setCart(response.data.cart);

    return response;
  };

  // Clear cart
  const emptyCart = async () => {
    const response = await clearCart();

    setCart(response.data.cart);

    return response;
  };

  const cartItemCount = cart.items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        cartItemCount,
        addProductToCart,
        changeCartItemQuantity,
        deleteCartItem,
        emptyCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};