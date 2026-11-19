import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Button,
  Chip,
  Divider,
  Grid,
} from "@mui/material";

import { getOrderById, getAdminOrderById } from "../api/orderApi";

const OrderDetailsPage = () => {
  const { orderId } = useParams();

  const navigate = useNavigate();
  const isAdminView = location.pathname.startsWith("/admin/orders/");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError("");

      try {
        const response = isAdminView
          ? await getAdminOrderById(orderId)
          : await getOrderById(orderId);
        setOrder(response.data.order);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to fetch order details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, isAdminView]);

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
      case "succeeded":
        return "success";
      case "shipped":
        return "info";
      case "processing":
        return "primary";
      case "pending":
        return "warning";
      case "failed":
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 3 }}>
          {error || "Order not found"}
        </Alert>

        <Button
          sx={{ mt: 2 }}
          variant="outlined"
          onClick={() => navigate(isAdminView ? "/admin/orders" : "/my-orders")}
        >
          Back to My Orders
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Button
          variant="outlined"
          onClick={() => navigate(isAdminView ? "/admin/orders" : "/my-orders")}
          sx={{ mb: 3 }}
        >
          Back to My Orders
        </Button>

        <Typography variant="h4" fontWeight={700}>
          Order Details
        </Typography>

        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Order ID: {order._id}
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Order Summary
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography color="text.secondary">
              Order Date
            </Typography>
            <Typography fontWeight={600}>
              {new Date(order.createdAt).toLocaleString("en-IN")}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography color="text.secondary">
              Total Amount
            </Typography>
            <Typography fontWeight={600}>
              ₹{order.totalAmount.toLocaleString("en-IN")}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography color="text.secondary">
              Payment Status
            </Typography>
            <Chip
              label={order.paymentStatus}
              color={getStatusColor(order.paymentStatus)}
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography color="text.secondary">
              Order Status
            </Typography>
            <Chip
              label={order.orderStatus}
              color={getStatusColor(order.orderStatus)}
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography color="text.secondary">
              Payment Method
            </Typography>
            <Typography fontWeight={600}>
              {order.paymentMethod}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Ordered Products
        </Typography>

        {order.items.map((item, index) => (
          <Box key={`${item.product}-${index}`}>
            <Box sx={{ display: "flex", gap: 2, py: 2 }}>
              {item.image && (
                <Box
                  component="img"
                  src={item.image}
                  alt={item.name}
                  sx={{
                    width: 90,
                    height: 90,
                    objectFit: "cover",
                    borderRadius: 1,
                  }}
                />
              )}

              <Box sx={{ flexGrow: 1 }}>
                <Typography fontWeight={600}>
                  {item.name}
                </Typography>

                <Typography color="text.secondary">
                  Price: ₹{item.price.toLocaleString("en-IN")}
                </Typography>

                <Typography color="text.secondary">
                  Quantity: {item.quantity}
                </Typography>
              </Box>

              <Typography fontWeight={700}>
                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
              </Typography>
            </Box>

            {index !== order.items.length - 1 && <Divider />}
          </Box>
        ))}
      </Paper>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Shipping Address
        </Typography>

        <Typography fontWeight={600}>
          {order.shippingAddress.fullName}
        </Typography>

        <Typography>{order.shippingAddress.phone}</Typography>
        <Typography>{order.shippingAddress.address}</Typography>

        <Typography>
          {order.shippingAddress.city},{" "}
          {order.shippingAddress.state} -{" "}
          {order.shippingAddress.postalCode}
        </Typography>

        <Typography>{order.shippingAddress.country}</Typography>
      </Paper>
    </Container>
  );
};

export default OrderDetailsPage;