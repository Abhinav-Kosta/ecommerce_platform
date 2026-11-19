import api from "./axios";

// Create a new order
export const createOrder = async (orderData) => {
  const response = await api.post("/orders", orderData);

  return response.data;
};

// Get logged-in customer's orders
export const getMyOrders = async (params = {}) => {
  const response = await api.get("/orders/my-orders", {
    params,
  });

  return response.data;
};

// Get a specific order by ID
export const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);

  return response.data;
};

// Get all orders (Admin)
export const getAdminOrders = async (params = {}) => {
  const response = await api.get("/orders/admin", {
    params,
  });

  return response.data;
};

// Get a specific order by ID (Admin)
export const getAdminOrderById = async (orderId) => {
  const response = await api.get(`/orders/admin/${orderId}`);

  return response.data;
};

// Update order status (Admin)
export const updateOrderStatus = async (orderId, orderStatus) => {
  const response = await api.patch(
    `/orders/admin/${orderId}/status`,
    { orderStatus }
  );

  return response.data;
};