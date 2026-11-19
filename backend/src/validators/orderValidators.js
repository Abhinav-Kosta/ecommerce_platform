const Joi = require("joi");

const createOrderSchema = Joi.object({
  shippingAddress: Joi.object({
    fullName: Joi.string().trim().min(2).max(100).required(),

    phone: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .required(),

    address: Joi.string().trim().min(5).max(300).required(),

    city: Joi.string().trim().min(2).max(100).required(),

    state: Joi.string().trim().min(2).max(100).required(),

    postalCode: Joi.string()
      .pattern(/^[0-9]{6}$/)
      .required(),

    country: Joi.string().trim().min(2).max(100).required(),
  }).required(),

  paymentMethod: Joi.string()
    .valid("demo")
    .required(),
});

const updateOrderStatusSchema = Joi.object({
  orderStatus: Joi.string()
    .valid("shipped", "delivered")
    .required(),
});

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema
};