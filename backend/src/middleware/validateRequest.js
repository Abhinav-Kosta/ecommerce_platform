const AppError = require("../utils/AppError");

const validateRequest = (schema, property = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      convert: true,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details
        .map((detail) => detail.message)
        .join(". ");

      return next(new AppError(message, 400));
    }

    // Store validated values separately from raw request data.
    req.validated = req.validated || {};
    req.validated[property] = value;

    next();
  };
};

module.exports = validateRequest;