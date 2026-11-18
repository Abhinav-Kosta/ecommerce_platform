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
  TablePagination,
  TableRow,
  TextField,
} from "@mui/material";

import { getProducts, createProduct, updateProduct, deleteProduct } from "../api/productApi";

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalProducts: 0,
  });
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

  const [editingProductId, setEditingProductId] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const resetForm = () => {
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
    setExistingImages([]);
    setImagesToRemove([]);
    setEditingProductId(null);
    setFormError("");
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRemoveExistingImage = (publicId) => {
    setExistingImages((prev) =>
      prev.filter((image) => image.publicId !== publicId)
    );

    setImagesToRemove((prev) => [...prev, publicId]);
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

  const handleEdit = (product) => {
    setEditingProductId(product._id);

    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice || "",
      category: product.category,
      brand: product.brand || "",
      stock: product.stock,
    });

    setImages([]);
    setExistingImages(product.images || []);
    setFormError("");
    setOpenDialog(true);
  };

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;

    setDeleting(true);

    try {
      await deleteProduct(selectedProduct._id);

      const response = await getProducts({
        page: pagination.page,
        limit: pagination.limit,
      });
      
      setProducts(response.data.products);
      
      setPagination({
        page: response.data.pagination.currentPage,
        limit: response.data.pagination.limit,
        totalPages: response.data.pagination.totalPages,
        totalProducts: response.data.pagination.totalProducts,
      });

      setDeleteDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to delete product"
      );
    } finally {
      setDeleting(false);
    }
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

      if (editingProductId && imagesToRemove.length > 0) {
        productFormData.append(
          "imagesToRemove",
          JSON.stringify(imagesToRemove)
        );
      }

      if (editingProductId) {
        await updateProduct(editingProductId, productFormData);
      } else {
        await createProduct(productFormData);
      }

      const response = await getProducts({
        page: pagination.page,
        limit: pagination.limit,
      });

      setProducts(response.data.products);

      setPagination({
        page: response.data.pagination.currentPage,
        limit: response.data.pagination.limit,
        totalPages: response.data.pagination.totalPages,
        totalProducts: response.data.pagination.totalProducts,
      });

      // setFormData({
      //   name: "",
      //   description: "",
      //   price: "",
      //   discountPrice: "",
      //   category: "",
      //   brand: "",
      //   stock: "",
      // });

      // setImages([]);
      // setOpenDialog(false);
      resetForm();
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
        const response = await getProducts({
          page: pagination.page,
          limit: pagination.limit,
        });

        setProducts(response.data.products);

        setPagination({
          page: response.data.pagination.currentPage,
          limit: response.data.pagination.limit,
          totalPages: response.data.pagination.totalPages,
          totalProducts: response.data.pagination.totalProducts,
        });
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
  }, [pagination.page, pagination.limit]);

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
        <DialogTitle>
          {editingProductId ? "Edit Product" : "Add New Product"}
        </DialogTitle>
              
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

                {existingImages.map((image) => (
                  <Box key={image.publicId}>
                    <Box
                      component="img"
                      src={image.url}
                      alt="Existing product"
                      sx={{
                        width: 80,
                        height: 80,
                        objectFit: "cover",
                        borderRadius: 1,
                      }}
                    />

                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleRemoveExistingImage(image.publicId)}
                    >
                      Remove
                    </Button>
                  </Box>
                ))}
              
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {images.length} image(s) selected. Maximum 5.
                </Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 2 }}>
                  {images.map((image, index) => (
                    <Box
                      key={`${image.name}-${index}`}
                      component="img"
                      src={URL.createObjectURL(image)}
                      alt={image.name}
                      sx={{
                        width: 80,
                        height: 80,
                        objectFit: "cover",
                        borderRadius: 1,
                      }}
                    />
                  ))}
                </Box>
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
              onClick={() => {
                resetForm();
                setOpenDialog(false);
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
          
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
            >
              {submitting
                ? editingProductId
                  ? "Updating..."
                  : "Creating..."
                : editingProductId
                  ? "Update Product"
                  : "Create Product"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Product</DialogTitle>

        <DialogContent>
          Are you sure you want to delete{" "}
          <strong>{selectedProduct?.name}</strong>?
          This action will make the product inactive.
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setSelectedProduct(null);
            }}
            disabled={deleting}
          >
            Cancel
          </Button>
          
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
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
                <TableCell><strong>Actions</strong></TableCell>
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
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleEdit(product)}
                        >
                          Edit
                        </Button>

                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleDeleteClick(product)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <TablePagination
        component="div"
        count={pagination.totalProducts}
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

export default AdminProductsPage;