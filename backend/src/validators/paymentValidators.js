const Joi = require("joi");

const processPaymentSchema = Joi.object({
  orderId: Joi.string()
    .hex()
    .length(24)
    .required(),

  paymentResult: Joi.string()
    .valid("success", "failure")
    .required(),
});

module.exports = {
  processPaymentSchema,
};