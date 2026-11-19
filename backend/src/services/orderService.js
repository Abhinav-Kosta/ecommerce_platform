const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const AppError = require("../utils/AppError");

const createOrder = async (userId, shippingAddress, paymentMethod) => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart || cart.items.length === 0) {
    throw new AppError("Your cart is empty", 400);
  }

  const orderItems = [];
  let totalAmount = 0;

  for (const item of cart.items) {
    const product = await Product.findOne({
      _id: item.product,
      isActive: true,
    });

    if (!product) {
      throw new AppError(
        "One or more products are no longer available",
        400
      );
    }

    if (item.quantity > product.stock) {
      throw new AppError(
        `Insufficient stock for ${product.name}`,
        400
      );
    }

    const price = product.discountPrice || product.price;

    orderItems.push({
      product: product._id,
      name: product.name,
      price,
      quantity: item.quantity,
      image: product.images?.[0]?.url || "",
    });

    totalAmount += price * item.quantity;
  }

  const order = await Order.create({
    user: userId,
    items: orderItems,
    shippingAddress,
    totalAmount,
    paymentMethod,
    paymentStatus: "pending",
    orderStatus: "pending",
  });

  return order;
};

module.exports = {
  createOrder,
};