const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(80)
    .required()
    .messages({
      "string.empty": "Name is required",
      "string.min": "Name must be at least 2 characters",
      "string.max": "Name cannot exceed 80 characters",
      "any.required": "Name is required",
    }),

  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .max(254)
    .required()
    .messages({
      "string.email": "Please provide a valid email address",
      "string.empty": "Email is required",
      "any.required": "Email is required",
    }),

  password: Joi.string()
    .min(8)
    .max(72)
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.max": "Password cannot exceed 72 characters",
      "string.empty": "Password is required",
      "any.required": "Password is required",
    }),
}).unknown(false);

const loginSchema = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .max(254)
    .required(),

  password: Joi.string()
    .required()
    .messages({
      "string.empty": "Password is required",
      "any.required": "Password is required",
    }),
}).unknown(false);

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    "string.empty": "Current password is required",
    "any.required": "Current password is required",
  }),

  newPassword: Joi.string().min(8).max(72).required().messages({
    "string.empty": "New password is required",
    "string.min": "New password must be at least 8 characters",
    "string.max": "New password cannot exceed 72 characters",
    "any.required": "New password is required",
  }),
}).unknown(false);

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema,
};