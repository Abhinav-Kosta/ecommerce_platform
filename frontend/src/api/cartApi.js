import api from "./axios";

// Get the user's cart
export const getCart = async () => {
  const response = await api.get("/cart");
  return response.data;
};

// Add a product to the cart
export const addToCart = async (productId, quantity) => {
  const response = await api.post("/cart", {
    productId,
    quantity,
  });

  return response.data;
};

// Update cart item quantity
export const updateCartItem = async (productId, quantity) => {
  const response = await api.patch(`/cart/${productId}`, {
    quantity,
  });

  return response.data;
};

// Remove a product from the cart
export const removeCartItem = async (productId) => {
  const response = await api.delete(`/cart/${productId}`);
  return response.data;
};

// Clear the entire cart
export const clearCart = async () => {
  const response = await api.delete("/cart");
  return response.data;
};