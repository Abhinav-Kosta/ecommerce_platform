const asyncHandler = require("../utils/asyncHandler");
const {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart
} = require("../services/cartService");

const addItemToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  const cart = await addToCart(
    req.user._id,
    productId,
    quantity
  );

  res.status(200).json({
    status: "success",
    message: "Product added to cart successfully",
    data: {
      cart,
    },
  });
});

const getUserCart = asyncHandler(async (req, res) => {
  const cart = await getCart(req.user._id);

  res.status(200).json({
    status: "success",
    data: {
      cart,
    },
  });
});

const updateCartItemQuantity = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  const cart = await updateCartItem(
    req.user._id,
    productId,
    quantity
  );

  res.status(200).json({
    status: "success",
    message: "Cart item updated successfully",
    data: {
      cart,
    },
  });
});

const removeItemFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await removeCartItem(
    req.user._id,
    productId
  );

  res.status(200).json({
    status: "success",
    message: "Product removed from cart successfully",
    data: {
      cart,
    },
  });
});

const clearUserCart = asyncHandler(async (req, res) => {
  const cart = await clearCart(req.user._id);

  res.status(200).json({
    status: "success",
    message: "Cart cleared successfully",
    data: {
      cart,
    },
  });
});

module.exports = {
  addItemToCart,
  getUserCart,
  updateCartItemQuantity,
  removeItemFromCart,
  clearUserCart
};