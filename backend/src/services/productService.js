const Product = require("../models/Product");
const AppError = require("../utils/AppError");

const validateDiscountPrice = (price, discountPrice) => {
  if (
    discountPrice !== undefined &&
    discountPrice !== null &&
    discountPrice >= price
  ) {
    throw new AppError(
      "Discount price must be lower than the original price",
      400
    );
  }
};

// Create a new product
const createProduct = async (productData) => {
  validateDiscountPrice(productData.price, productData.discountPrice);

  const product = await Product.create(productData);

  return product;
};

// Get all active products with filtering, sorting, and pagination
const getAllProducts = async (query) => {
  const {
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    sort = "newest",
    page = 1,
    limit = 12,
  } = query;

  const filter = {
    isActive: true,
  };

  // Search by product name or description
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // Filter by category
  if (category) {
    filter.category = category;
  }

  // Filter by brand
  if (brand) {
    filter.brand = brand;
  }

  // Filter by price range
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};

    if (minPrice !== undefined) {
      filter.price.$gte = Number(minPrice);
    }

    if (maxPrice !== undefined) {
      filter.price.$lte = Number(maxPrice);
    }
  }

  // Sorting options
  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    name_asc: { name: 1 },
    name_desc: { name: -1 },
  };

  const sortBy = sortOptions[sort] || sortOptions.newest;

  const currentPage = Number(page);
  const resultsPerPage = Number(limit);
  const skip = (currentPage - 1) * resultsPerPage;

  const [products, totalProducts] = await Promise.all([
    Product.find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(resultsPerPage),

    Product.countDocuments(filter),
  ]);

  return {
    products,
    pagination: {
      totalProducts,
      currentPage,
      totalPages: Math.ceil(totalProducts / resultsPerPage),
      limit: resultsPerPage,
    },
  };
};

// Get a single active product by ID
const getProductById = async (productId) => {
  const product = await Product.findOne({
    _id: productId,
    isActive: true,
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return product;
};

// Update an active product
const updateProduct = async (productId, updateData) => {
  const existingProduct = await Product.findOne({
    _id: productId,
    isActive: true,
  });

  if (!existingProduct) {
    throw new AppError("Product not found", 404);
  }

  const updatedPrice =
    updateData.price !== undefined
      ? updateData.price
      : existingProduct.price;

  const updatedDiscountPrice =
    updateData.discountPrice !== undefined
      ? updateData.discountPrice
      : existingProduct.discountPrice;

  validateDiscountPrice(updatedPrice, updatedDiscountPrice);

  const product = await Product.findByIdAndUpdate(
    productId,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );

  return product;
};

// Soft-delete an active product
const deleteProduct = async (productId) => {
  const product = await Product.findOneAndUpdate(
    {
      _id: productId,
      isActive: true,
    },
    {
      isActive: false,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return product;
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};