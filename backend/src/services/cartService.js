const Cart = require("../models/Cart");
const Product = require("../models/Product");
const AppError = require("../utils/AppError");

const addToCart = async (userId, productId, quantity) => {
  // Check whether the product exists and is active
  const product = await Product.findOne({
    _id: productId,
    isActive: true,
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  // Check available stock
  if (product.stock < quantity) {
    throw new AppError("Insufficient product stock", 400);
  }

  // Find the user's cart or create a new one
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [{ product: productId, quantity }],
    });
  } else {
    // Check whether the product already exists in the cart
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      const updatedQuantity = existingItem.quantity + quantity;

      if (updatedQuantity > product.stock) {
        throw new AppError("Insufficient product stock", 400);
      }

      existingItem.quantity = updatedQuantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
      });
    }

    await cart.save();
  }

  // Return cart with populated product details
  return await Cart.findById(cart._id).populate(
    "items.product",
    "name price discountPrice images stock"
  );
};

const getCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId }).populate(
    "items.product",
    "name price discountPrice images stock"
  );

  // Return an empty cart if the user has not added anything
  if (!cart) {
    return {
      user: userId,
      items: [],
    };
  }

  return cart;
};

const updateCartItem = async (userId, productId, quantity) => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new AppError("Cart not found", 404);
  }

  const cartItem = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (!cartItem) {
    throw new AppError("Product not found in cart", 404);
  }

  const product = await Product.findOne({
    _id: productId,
    isActive: true,
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  if (quantity > product.stock) {
    throw new AppError("Insufficient product stock", 400);
  }

  cartItem.quantity = quantity;

  await cart.save();

  return await Cart.findById(cart._id).populate(
    "items.product",
    "name price discountPrice images stock"
  );
};

const removeCartItem = async (userId, productId) => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new AppError("Cart not found", 404);
  }

  const itemExists = cart.items.some(
    (item) => item.product.toString() === productId
  );

  if (!itemExists) {
    throw new AppError("Product not found in cart", 404);
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  await cart.save();

  return await Cart.findById(cart._id).populate(
    "items.product",
    "name price discountPrice images stock"
  );
};

const clearCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new AppError("Cart not found", 404);
  }

  cart.items = [];

  await cart.save();

  return cart;
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart
};