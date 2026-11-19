import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";

import { getAdminOrders, updateOrderStatus } from "../api/orderApi";

const AdminOrdersPage = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalOrders: 0,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getAdminOrders({
          page: pagination.page,
          limit: pagination.limit,
        });

        setOrders(response.data.orders);

        setPagination((prev) => ({
          ...prev,
          totalOrders: response.data.totalOrders,
          totalPages: response.data.totalPages,
        }));
      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Failed to fetch orders"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [pagination.page, pagination.limit]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    setError("");
  
    try {
      await updateOrderStatus(orderId, newStatus);
  
      const response = await getAdminOrders({
        page: pagination.page,
        limit: pagination.limit,
      });
  
      setOrders(response.data.orders);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to update order status"
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={700}>
          Order Management
        </Typography>
      </Box>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Order ID</strong></TableCell>
                <TableCell><strong>Customer</strong></TableCell>
                <TableCell><strong>Total Amount</strong></TableCell>
                <TableCell><strong>Payment Status</strong></TableCell>
                <TableCell><strong>Order Status</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
                <TableCell><strong>View</strong></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>{order._id}</TableCell>

                    <TableCell>
                      {order.user?.name || "Unknown"}
                      <br />
                      {order.user?.email || ""}
                    </TableCell>

                    <TableCell>
                      ₹{order.totalAmount.toLocaleString("en-IN")}
                    </TableCell>

                    <TableCell>
                      {order.paymentStatus}
                    </TableCell>

                    <TableCell>
                      {order.orderStatus}
                    </TableCell>

                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </TableCell>

                    <TableCell>
                      {order.paymentStatus === "succeeded" &&
                        order.orderStatus === "processing" && (
                          <Button
                            variant="contained"
                            size="small"
                            disabled={updatingOrderId === order._id}
                            onClick={() => handleStatusUpdate(order._id, "shipped")}
                          >
                            Ship Order
                          </Button>
                        )}

                      {order.paymentStatus === "succeeded" &&
                        order.orderStatus === "shipped" && (
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            disabled={updatingOrderId === order._id}
                            onClick={() => handleStatusUpdate(order._id, "delivered")}
                          >
                            Mark Delivered
                          </Button>
                        )}

                      {updatingOrderId === order._id && (
                        <CircularProgress size={20} sx={{ ml: 1 }} />
                      )}
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`/admin/orders/${order._id}`)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <TablePagination
        component="div"
        count={pagination.totalOrders}
        page={pagination.page - 1}
        rowsPerPage={pagination.limit}
        rowsPerPageOptions={[5, 10, 25, 50]}
        onPageChange={(event, newPage) => {
          setPagination((prev) => ({
            ...prev,
            page: newPage + 1,
          }));
        }}
        onRowsPerPageChange={(event) => {
          setPagination((prev) => ({
            ...prev,
            page: 1,
            limit: Number(event.target.value),
          }));
        }}
      />
    </Container>
  );
};

export default AdminOrdersPage;