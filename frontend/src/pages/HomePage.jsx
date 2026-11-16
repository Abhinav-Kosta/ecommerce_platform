import { Box, Typography, Button, Container } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

// import { useAuth } from "../context/AuthContext";

function HomePage() {

  // const { user } = useAuth();
  // console.log("Current logged-in user:", user);

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          textAlign: "center",
          py: { xs: 8, md: 12 },
        }}
      >
        <Typography variant="h2" gutterBottom>
          Welcome to ShopEase
        </Typography>

        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          Discover amazing products at great prices.
          Your shopping experience starts here.
        </Typography>

        <Button
          variant="contained"
          size="large"
          component={RouterLink}
          to="/products"
        >
          Explore Products
        </Button>
      </Box>
    </Container>
  );
}

export default HomePage;