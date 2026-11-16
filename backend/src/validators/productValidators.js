const Joi = require("joi");


const createProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).required(),

  description: Joi.string().trim().min(10).max(5000).required(),

  price: Joi.number().positive().required(),

  discountPrice: Joi.number()
    .positive()
    .less(Joi.ref("price"))
    .optional(),

  category: Joi.string().trim().min(2).max(100).required(),

  brand: Joi.string().trim().max(100).allow("", null).optional(),

  // images: Joi.array()
  //   .items(Joi.string().uri())
  //   .default([]),

  stock: Joi.number().integer().min(0).required(),
});

const updateProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150),

  description: Joi.string().trim().min(10).max(5000),

  price: Joi.number().positive(),

  discountPrice: Joi.number()
    .positive()
    .less(Joi.ref("price")),

  category: Joi.string().trim().min(2).max(100),

  brand: Joi.string().trim().max(100).allow("", null),

  // images: Joi.array()
  //   .items(Joi.string().uri()),

  stock: Joi.number().integer().min(0),
}).min(1)
  .custom((value, helpers) => {
    if (
      value.discountPrice !== undefined &&
      value.price === undefined
    ) {
      return helpers.error("any.invalid");
    }

    return value;
  })
  .messages({
    "any.invalid":
      "Price must be included when updating discountPrice",
    "object.min": "At least one field must be provided for update",
  });


const productQuerySchema = Joi.object({
  search: Joi.string().trim().max(100),

  category: Joi.string().trim().max(100),

  brand: Joi.string().trim().max(100),

  minPrice: Joi.number().min(0),

  maxPrice: Joi.number().min(0),

  sort: Joi.string()
    .valid(
      "newest",
      "oldest",
      "price_asc",
      "price_desc",
      "name_asc",
      "name_desc"
    )
    .default("newest"),

  page: Joi.number().integer().min(1).default(1),

  limit: Joi.number().integer().min(1).max(100).default(12),
}).custom((value, helpers) => {
  if (
    value.minPrice !== undefined &&
    value.maxPrice !== undefined &&
    value.minPrice > value.maxPrice
  ) {
    return helpers.error("any.invalid");
  }

  return value;
}).messages({
  "any.invalid": "Minimum price cannot exceed maximum price",
});

const productIdSchema = Joi.object({
  id: Joi.string()
    .hex()
    .length(24)
    .required(),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  productIdSchema,
};