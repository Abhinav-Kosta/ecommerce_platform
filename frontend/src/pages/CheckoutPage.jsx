import { useCart } from "../context/CartContext";
import { useState } from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";

import { createOrder } from "../api/orderApi";
import { processPayment } from "../api/paymentApi";

function CheckoutPage() {
  const { cart, emptyCart } = useCart();

  const [paymentMethod, setPaymentMethod] = useState("demo");

  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  const [errors, setErrors] = useState({});

  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState(null);
  const [submitError, setSubmitError] = useState("");  

  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleAddressChange = (event) => {
    const { name, value } = event.target;

    setShippingAddress((previousAddress) => ({
      ...previousAddress,
      [name]: value,
    }));
  };

  const cartTotal = cart.items.reduce((total, item) => {
    const product = item.product;

    if (!product) return total;

    const price = product.discountPrice || product.price;

    return total + price * item.quantity;
  }, 0);

  const validateAddress = () => {
    const newErrors = {};

    Object.entries(shippingAddress).forEach(([field, value]) => {
      if (!value.trim()) {
        newErrors[field] = "This field is required";
      }
    });

    if (
      shippingAddress.phone &&
      !/^[0-9]{10}$/.test(shippingAddress.phone)
    ) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }

    if (
      shippingAddress.postalCode &&
      !/^[0-9]{6}$/.test(shippingAddress.postalCode)
    ) {
      newErrors.postalCode = "Enter a valid 6-digit PIN code";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateAddress()) {
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError("");

      const response = await createOrder({
        shippingAddress,
        paymentMethod,
      });

      setOrder(response.data.order);
    } catch (error) {
      setSubmitError(
        error.response?.data?.message ||
        "Failed to create order. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoPayment = async (paymentResult) => {
    if (!order) {
      setPaymentError("Please create an order first.");
      return;
    }

    try {
      setPaymentProcessing(true);
      setPaymentError("");
      setPaymentSuccess(false);

      const response = await processPayment(
        order._id,
        paymentResult
      );

      setOrder(response.data.order);

      if (response.data.order.paymentStatus === "succeeded") {
        await emptyCart();
        setPaymentSuccess(true);
      } else {
        setPaymentError("Demo payment failed. Please try again.");
      }
    } catch (error) {
      setPaymentError(
        error.response?.data?.message ||
        "Payment processing failed. Please try again."
      );
    } finally {
      setPaymentProcessing(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Checkout
        </Typography>

        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Shipping Address
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                },
                gap: 2,
                mt: 2,
              }}
            >
              <TextField
                label="Full Name"
                name="fullName"
                value={shippingAddress.fullName}
                onChange={handleAddressChange}
                error={Boolean(errors.fullName)}
                helperText={errors.fullName}
                required
                fullWidth
              />

              <TextField
                label="Phone Number"
                name="phone"
                type="tel"
                value={shippingAddress.phone}
                onChange={handleAddressChange}
                error={Boolean(errors.phone)}
                helperText={errors.phone}
                required
                fullWidth
              />

              <TextField
                label="Address"
                name="address"
                value={shippingAddress.address}
                onChange={handleAddressChange}
                error={Boolean(errors.address)}
                helperText={errors.address}
                required
                fullWidth
                sx={{ gridColumn: "1 / -1" }}
              />

              <TextField
                label="City"
                name="city"
                value={shippingAddress.city}
                onChange={handleAddressChange}
                error={Boolean(errors.city)}
                helperText={errors.city}
                required
                fullWidth
              />

              <TextField
                label="State"
                name="state"
                value={shippingAddress.state}
                onChange={handleAddressChange}
                error={Boolean(errors.state)}
                helperText={errors.state}
                required
                fullWidth
              />

              <TextField
                label="Postal Code"
                name="postalCode"
                value={shippingAddress.postalCode}
                onChange={handleAddressChange}
                error={Boolean(errors.postalCode)}
                helperText={errors.postalCode}
                required
                fullWidth
              />

              <TextField
                label="Country"
                name="country"
                value={shippingAddress.country}
                onChange={handleAddressChange}
                error={Boolean(errors.country)}
                helperText={errors.country}
                required
                fullWidth
              />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Payment Method
            </Typography>

            <FormControl sx={{ mt: 1 }}>
              <FormLabel>Choose your payment method</FormLabel>

              <RadioGroup
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
              >
                <FormControlLabel
                  value="demo"
                  control={<Radio />}
                  label="Demo Payment (Test Mode)"
                />
              </RadioGroup>
            </FormControl>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              This is a simulated payment method. No actual money will be charged.
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h5" fontWeight={700}>
              Order Summary
            </Typography>

            <Typography sx={{ mt: 2 }}>
              Total Items: {cart.items.reduce(
                (total, item) => total + item.quantity,
                0
              )}
            </Typography>

            <Typography variant="h6" fontWeight={700} sx={{ mt: 2 }}>
              Total Amount: ₹{cartTotal.toLocaleString("en-IN")}
            </Typography>
          </CardContent>
        </Card>

        {submitError && (
          <Typography
            color="error"
            sx={{ mt: 2 }}
          >
            {submitError}
          </Typography>
        )}

        <Button
          variant="contained"
          fullWidth
          size="large"
          sx={{ mt: 3 }}
          onClick={handlePlaceOrder}
          disabled={submitting || Boolean(order)}
        >
          {order
            ? "Order Created"
            : submitting
              ? "Creating Order..."
              : "Place Order"}
        </Button>

        {order &&
          (order.paymentStatus === "pending" ||
            order.paymentStatus === "failed") && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Demo Payment Simulation
            </Typography>
        
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Choose an outcome to simulate your payment.
            </Typography>
        
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Button
                variant="contained"
                color="success"
                disabled={paymentProcessing}
                onClick={() => handleDemoPayment("success")}
              >
                Simulate Successful Payment
              </Button>
        
              <Button
                variant="outlined"
                color="error"
                disabled={paymentProcessing}
                onClick={() => handleDemoPayment("failure")}
              >
                Simulate Failed Payment
              </Button>
            </Box>
          </Box>
        )}

        {paymentSuccess && (
          <Typography
            color="success.main"
            fontWeight={600}
            sx={{ mt: 3 }}
          >
            Payment successful! Your order has been confirmed.
            Order ID: {order?._id}
          </Typography>
        )}

        {paymentError && (
          <Typography
            color="error"
            fontWeight={600}
            sx={{ mt: 3 }}
          >
            {paymentError}
          </Typography>
        )}
      </Box>
    </Container>
  );
}

export default CheckoutPage;