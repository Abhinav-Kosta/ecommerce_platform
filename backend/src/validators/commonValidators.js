const Joi = require("joi");

const paginationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(12),
});

module.exports = {
  paginationQuerySchema,
};