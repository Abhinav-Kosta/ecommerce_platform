import api from "./axios";

// Create a new order
export const createOrder = async (orderData) => {
  const response = await api.post("/orders", orderData);

  return response.data;
};