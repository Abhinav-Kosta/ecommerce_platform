import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  Box,
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
  Chip,
} from "@mui/material";

import { getMyOrders } from "../api/orderApi";

const MyOrdersPage = () => {
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

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getMyOrders({
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
          error.response?.data?.message || "Failed to fetch your orders"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [pagination.page, pagination.limit]);

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={700}>
          My Orders
        </Typography>

        <Typography color="text.secondary" sx={{ mt: 1 }}>
          View your order history and track your purchases.
        </Typography>
      </Box>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Order ID</strong></TableCell>
                  <TableCell><strong>Order Date</strong></TableCell>
                  <TableCell><strong>Total Amount</strong></TableCell>
                  <TableCell><strong>Payment</strong></TableCell>
                  <TableCell><strong>Order Status</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>{order._id}</TableCell>

                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      </TableCell>

                      <TableCell>
                        ₹{order.totalAmount.toLocaleString("en-IN")}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={order.paymentStatus}
                          color={getStatusColor(order.paymentStatus)}
                          size="small"
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={order.orderStatus}
                          color={getStatusColor(order.orderStatus)}
                          size="small"
                        />
                      </TableCell>

                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => navigate(`/my-orders/${order._id}`)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      You haven't placed any orders yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={pagination.totalOrders}
            page={pagination.page - 1}
            rowsPerPage={pagination.limit}
            rowsPerPageOptions={[5, 10, 25, 50]}
            onPageChange={(event, newPage) =>
              setPagination((prev) => ({
                ...prev,
                page: newPage + 1,
              }))
            }
            onRowsPerPageChange={(event) =>
              setPagination((prev) => ({
                ...prev,
                page: 1,
                limit: Number(event.target.value),
              }))
            }
          />
        </>
      )}
    </Container>
  );
};

export default MyOrdersPage;