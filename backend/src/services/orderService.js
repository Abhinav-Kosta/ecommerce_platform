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

const getUserOrders = async (userId, page, limit) => {
  const skip = (page - 1) * limit;

  const [orders, totalOrders] = await Promise.all([
    Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Order.countDocuments({ user: userId }),
  ]);

  return {
    orders,
    totalOrders,
    currentPage: page,
    totalPages: Math.ceil(totalOrders / limit),
  };
};

const getOrderById = async (orderId, userId) => {
  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  });

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  return order;
};

const getAdminOrderById = async (orderId) => {
  const order = await Order.findById(orderId)
    .populate("user", "name email");

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  return order;
};

const getAllOrders = async (page, limit) => {
  const skip = (page - 1) * limit;

  const [orders, totalOrders] = await Promise.all([
    Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Order.countDocuments(),
  ]);

  return {
    orders,
    totalOrders,
    currentPage: page,
    totalPages: Math.ceil(totalOrders / limit),
  };
};

const updateOrderStatus = async (orderId, orderStatus) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  if (order.paymentStatus !== "succeeded") {
    throw new AppError(
      "Only successfully paid orders can be fulfilled",
      400
    );
  }

  const allowedTransitions = {
    processing: ["shipped"],
    shipped: ["delivered"],
  };

  const allowedStatuses = allowedTransitions[order.orderStatus] || [];

  if (!allowedStatuses.includes(orderStatus)) {
    throw new AppError(
      `Cannot change order status from ${order.orderStatus} to ${orderStatus}`,
      400
    );
  }

  order.orderStatus = orderStatus;

  await order.save();

  return order;
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  getAdminOrderById,
  getAllOrders,
  updateOrderStatus,
};