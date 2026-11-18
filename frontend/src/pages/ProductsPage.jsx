import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
} from "@mui/material";

import { useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";
import { getProducts } from "../api/productApi";

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts({
          page: 1,
          limit: 12,
        });

        setProducts(response.data.products);
      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Failed to load products."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          All Products
        </Typography>

        <Typography color="text.secondary">
          Browse our collection of products.
        </Typography>

        {loading && (
          <Typography sx={{ mt: 4 }}>
            Loading products...
          </Typography>
        )}

        {!loading && error && (
          <Typography color="error" sx={{ mt: 4 }}>
            {error}
          </Typography>
        )}

        {!loading && !error && products.length === 0 && (
          <Typography color="text.secondary" sx={{ mt: 4 }}>
            No products available at the moment.
          </Typography>
        )}
        {!loading && !error && products.length > 0 && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              gap: 3,
              mt: 4,
              alignItems: "stretch",
            }}
          >
            {products.map((product) => (
              <Card
                key={product._id}
                sx={{
                  width: "100%",
                  height: 380,
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 2,
                }}
              >
                {/* Image section */}
                <Box
                  sx={{
                    height: 210,
                    minHeight: 210,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 2,
                    boxSizing: "border-box",
                  }}
                >
                  <CardMedia
                    component="img"
                    image={product.images?.[0]?.url || "/placeholder.png"}
                    alt={product.name}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </Box>
                  
                {/* Product information */}
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    sx={{
                      height: 56,
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {product.name}
                  </Typography>
                  
                  {product.discountPrice ? (
                    <Box sx={{ mt: 1 }}>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        color="primary"
                        component="span"
                      >
                        ₹{product.discountPrice}
                      </Typography>
                                    
                      <Typography
                        component="span"
                        sx={{
                          ml: 1,
                          textDecoration: "line-through",
                          color: "text.secondary",
                          fontSize: "0.9rem",
                        }}
                      >
                        ₹{product.price}
                      </Typography>
                      
                      <Typography
                        variant="body2"
                        color="success.main"
                        fontWeight={600}
                        sx={{ mt: 0.5 }}
                      >
                        {Math.round(
                          ((product.price - product.discountPrice) / product.price) * 100
                        )}% OFF
                      </Typography>
                    </Box>
                  ) : (
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      sx={{ mt: 1 }}
                    >
                      ₹{product.price}
                    </Typography>
                  )}
                  
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ mt: "auto" }}
                    onClick={() => navigate(`/products/${product._id}`)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default ProductsPage;