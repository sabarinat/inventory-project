
const Joi = require('joi');

// User validation
const userSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  mail: Joi.string().trim().email().max(255).required(),
  password: Joi.string().trim().min(6).max(100).required(),
  role: Joi.alternatives()
    .try(Joi.number().valid(1, 2), Joi.string().valid('1', '2'))
    .required(),
  mobileNumber: Joi.string()
    .pattern(/^[0-9+()\-\s]{7,15}$/)
    .allow(null, '')
    .optional()
});

// Product validation
const productSchema = Joi.object({
  name: Joi.string().trim().min(1).max(150).required(),
  count: Joi.number().integer().min(0).required(),
  buyPrice: Joi.number().precision(2).min(0).required(),
  sellPrice: Joi.number().precision(2).min(0).required()
});

// ID validation
const idSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

// Reusable validation middleware
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      convert: true,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(detail => detail.message)
      });
    }

    req[property] = value;
    next();
  };
};

const createBillSchema = Joi.object({
  userId: Joi.number().integer().positive().required(),

  isTaxApplied: Joi.boolean().required(),

  taxAppliedPercent: Joi.number()
    .min(0)
    .max(100)
    .when("isTaxApplied", {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),

  products: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().integer().positive().required(),

        count: Joi.number().integer().positive().required(),

        unitPrice: Joi.number().precision(2).min(0).required(),
      })
    )
    .min(1)
    .required(),
});

const getBillByIdSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const updatePaidStatusSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
  paid_status: Joi.number().integer().valid(1, 2).required(),
});

module.exports = {
  userSchema,
  productSchema,
  idSchema,
  validate,
  createBillSchema,
  getBillByIdSchema,
  updatePaidStatusSchema
};
