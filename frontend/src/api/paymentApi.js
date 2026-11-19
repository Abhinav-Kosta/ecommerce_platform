import api from "./axios";

// Process a demo payment
export const processPayment = async (orderId, paymentResult) => {
  const response = await api.post("/payments", {
    orderId,
    paymentResult,
  });

  return response.data;
};