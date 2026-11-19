import { useCart } from "../context/CartContext";

import {
  Container,
  Typography,
  Box,
  Card,
  CardMedia,
  CardContent,
  Button
} from "@mui/material";

function CartPage() {
  const {
    cart,
    loading,
    changeCartItemQuantity,
    deleteCartItem,
    emptyCart
  } = useCart();

  const cartTotal = cart.items.reduce((total, item) => {
    const product = item.product;

    if (!product) return total;

    const price = product.discountPrice || product.price;

    return total + price * item.quantity;
  }, 0);

  const totalItems = cart.items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Typography sx={{ py: 4 }}>
          Loading your cart...
        </Typography>
      </Container>
    );
  }
  
  if (!cart.items || cart.items.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: "center" }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Your Cart is Empty
          </Typography>
  
          <Typography color="text.secondary">
            You haven't added any products to your cart yet.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Shopping Cart
        </Typography>

        {cart.items.length > 0 && (
          <Button
            variant="outlined"
            color="error"
            onClick={emptyCart}
          >
            Clear Cart
          </Button>
        )}
  
        <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          {cart.items.map((item, index) => {
            const product = item.product;
  
            if (!product) return null;
  
            return (
              <Card
                key={product._id || index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  p: 2,
                  gap: 2,
                }}
              >
                <CardMedia
                  component="img"
                  image={product.images?.[0]?.url || "/placeholder.png"}
                  alt={product.name}
                  sx={{
                    width: 120,
                    height: 120,
                    objectFit: "contain",
                  }}
                />
  
                <CardContent sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={600}>
                    {product.name}
                  </Typography>
  
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    Price: ₹{product.discountPrice || product.price}
                  </Typography>
  
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={item.quantity <= 1}
                      onClick={() =>
                        changeCartItemQuantity(product._id, item.quantity - 1)
                      }
                    >
                      -
                    </Button>
                  
                    <Typography fontWeight={600}>
                      {item.quantity}
                    </Typography>
                  
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={item.quantity >= product.stock}
                      onClick={() =>
                        changeCartItemQuantity(product._id, item.quantity + 1)
                      }
                    >
                      +
                    </Button>

                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      sx={{ mt: 2 }}
                      onClick={() => deleteCartItem(product._id)}
                    >
                      Remove
                    </Button>
                  </Box>
  
                  <Typography fontWeight={700} sx={{ mt: 1 }}>
                    Subtotal: ₹
                    {(product.discountPrice || product.price) * item.quantity}
                  </Typography>
                </CardContent>
              </Card>
            );
          })}
        </Box>
        <Card sx={{ mt: 3, p: 3 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Cart Summary
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography color="text.secondary">
              Total Items
            </Typography>

            <Typography fontWeight={600}>
              {totalItems}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography color="text.secondary">
              Total Amount
            </Typography>

            <Typography variant="h5" fontWeight={700}>
              ₹{cartTotal.toLocaleString("en-IN")}
            </Typography>
          </Box>
          <Button
            variant="contained"
            fullWidth
            size="large"
            sx={{ mt: 2 }}
            onClick={() => window.location.href = "/checkout"}
          >
            Proceed to Checkout
          </Button>
        </Card>
      </Box>
    </Container>
  );
}

export default CartPage;