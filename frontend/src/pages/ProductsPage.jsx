import {
  Container,
  Typography,
  Box,
} from "@mui/material";

function ProductsPage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          All Products
        </Typography>

        <Typography color="text.secondary">
          Browse our collection of products.
        </Typography>
      </Box>
    </Container>
  );
}

export default ProductsPage;