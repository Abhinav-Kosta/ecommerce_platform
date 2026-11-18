import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  Container,
  Typography,
  Box,
  Grid,
  CardMedia,
  Divider,
  ButtonBase,
  Button
} from "@mui/material";

import { getProductById } from "../api/productApi";

function ProductDetailsPage() {
  const { productId } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedImage, setSelectedImage] = useState(0);

  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await getProductById(productId);
        setProduct(response.data.product);
      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Failed to load product details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Typography sx={{ py: 4 }}>
          Loading product details...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Typography color="error" sx={{ py: 4 }}>
          {error}
        </Typography>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg">
        <Typography sx={{ py: 4 }}>
          Product not found.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Product Image */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                height: 450,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "background.paper",
                borderRadius: 2,
                border: 1,
                borderColor: "divider",
                p: 3,
              }}
            >
              <CardMedia
                component="img"
                image={
                  product.images?.[selectedImage]?.url || "/placeholder.png"
                }
                alt={product.name}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            </Box>
            {product.images?.length > 1 && (
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  mt: 2,
                  flexWrap: "wrap",
                }}
              >
                {product.images.map((image, index) => (
                  <ButtonBase
                    key={image.publicId || index}
                    onClick={() => setSelectedImage(index)}
                    sx={{
                      width: 80,
                      height: 80,
                      border: 2,
                      borderColor:
                        selectedImage === index ? "primary.main" : "divider",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={image.url}
                      alt={`${product.name} ${index + 1}`}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        p: 1,
                      }}
                    />
                  </ButtonBase>
                ))}
              </Box>
            )}
          </Grid>

          {/* Product Information */}
          <Grid item xs={12} md={6}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {product.name}
            </Typography>

            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {product.brand}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body1" sx={{ mb: 3 }}>
              {product.description}
            </Typography>

            <Typography variant="h5" fontWeight={700}>
              ₹{product.discountPrice || product.price}
            </Typography>

            {product.discountPrice && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
                <Typography
                  color="text.secondary"
                  sx={{ textDecoration: "line-through" }}
                >
                  ₹{product.price}
                </Typography>

                <Typography
                  color="success.main"
                  fontWeight={700}
                >
                  {Math.round(
                    ((product.price - product.discountPrice) / product.price) * 100
                  )}% OFF
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography>
              Category: {product.category}
            </Typography>

            <Typography sx={{ mt: 1 }}>
              Available Stock: {product.stock}
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Typography fontWeight={600} gutterBottom>
                Quantity
              </Typography>
                      
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Button
                  variant="outlined"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((prev) => prev - 1)}
                >
                  -
                </Button>
                      
                <Typography fontWeight={600}>
                  {quantity}
                </Typography>
                      
                <Button
                  variant="outlined"
                  disabled={quantity >= product.stock}
                  onClick={() => setQuantity((prev) => prev + 1)}
                >
                  +
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default ProductDetailsPage;