const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const AppError = require("../utils/AppError");


const processDemoPayment = async (userId, orderId, paymentResult) => {
  const session = await Order.startSession();

  try {
    session.startTransaction();

    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    }).session(session);

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    const paymentLock = await Order.findOneAndUpdate(
      {
        _id: orderId,
        user: userId,
        paymentStatus: { $in: ["pending", "failed"] },
      },
      {
        $set: {
          paymentStatus: "pending",
        },
      },
      {
        new: true,
        session,
      }
    );
    
    if (!paymentLock) {
      throw new AppError(
        "Payment has already been completed or is being processed",
        400
      );
    }

    if (paymentResult === "failure") {
      order.paymentStatus = "failed";

      await order.save({ session });
      await session.commitTransaction();

      return order;
    }
    
    // Deduct stock for every product in the order.
    for (const item of order.items) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.product,
          isActive: true,
          stock: { $gte: item.quantity },
        },
        {
          $inc: { stock: -item.quantity },
        },
        {
          new: true,
          session,
        }
      );
    
      if (!updatedProduct) {
        throw new AppError(
          `Insufficient stock or product unavailable for ${item.name}`,
          400
        );
      }
    }

    // Clear the customer's cart after successful payment.
    const cart = await Cart.findOne({ user: userId }).session(session);
      
    if (cart) {
      cart.items = [];
      await cart.save({ session });
    }
    
    order.paymentStatus = "succeeded";
    order.orderStatus = "processing";

    await order.save({ session });
    await session.commitTransaction();

    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

module.exports = {
  processDemoPayment,
};