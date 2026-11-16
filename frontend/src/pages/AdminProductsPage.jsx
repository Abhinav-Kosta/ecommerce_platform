import { useState, useEffect } from "react";

import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";

import { getProducts, createProduct } from "../api/productApi";

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    category: "",
    brand: "",
    stock: "",
  });

  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const selectedImages = Array.from(event.target.files);

    if (selectedImages.length > 5) {
      setFormError("You can upload a maximum of 5 images.");
      setImages([]);
      event.target.value = "";
      return;
    }

    setFormError("");
    setImages(selectedImages);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitting(true);
    setFormError("");

    try {
      const productFormData = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== "") {
          productFormData.append(key, value);
        }
      });

      images.forEach((image) => {
        productFormData.append("images", image);
      });

      await createProduct(productFormData);

      const response = await getProducts();
      setProducts(response.data.products);

      setFormData({
        name: "",
        description: "",
        price: "",
        discountPrice: "",
        category: "",
        brand: "",
        stock: "",
      });

      setImages([]);
      setOpenDialog(false);
    } catch (error) {
      setFormError(
        error.response?.data?.message ||
        "Failed to create product"
      );
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts();
        setProducts(response.data.products);
      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Failed to fetch products"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          py: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          Product Management
        </Typography>

        <Button
          variant="contained"
          onClick={() => {
            setFormError("");
            setOpenDialog(true);
          }}
        >
          Add Product
        </Button>
      </Box>

      <Dialog
        open={openDialog}
        onClose={() => !submitting && setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add New Product</DialogTitle>
              
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Product Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Discount Price"
                  name="discountPrice"
                  value={formData.discountPrice}
                  onChange={handleInputChange}
                />
              </Grid>
              
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Stock Quantity"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  component="label"
                  variant="outlined"
                >
                  Select Product Images
                  <input
                    hidden
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleImageChange}
                  />
                </Button>
              
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {images.length} image(s) selected. Maximum 5.
                </Typography>
              </Grid>
            </Grid>
              
            {formError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {formError}
              </Alert>
            )}
          </DialogContent>
          
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => setOpenDialog(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
          
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Create Product"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

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
                <TableCell><strong>Image</strong></TableCell>
                <TableCell><strong>Product Name</strong></TableCell>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell><strong>Price</strong></TableCell>
                <TableCell><strong>Stock</strong></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      {product.images?.length > 0 ? (
                        <Box
                          component="img"
                          src={product.images[0].url}
                          alt={product.name}
                          sx={{
                            width: 60,
                            height: 60,
                            objectFit: "cover",
                            borderRadius: 1,
                          }}
                        />
                      ) : (
                        "No image"
                      )}
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      ₹{product.price.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>{product.stock}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default AdminProductsPage;