
const express = require('express');
const APIController = require('../common/api-handler');
const {authenticateToken} = require('../common/jwt-ops');

const {
  productSchema,
  idSchema,
  validate
} = require('../validation/api-validation');

const router = express.Router();
const api = new APIController();

router.post(
  '/',
  validate(productSchema),
  authenticateToken,  
  api.addProduct.bind(api)
);

router.put(
  '/:id',
  validate(idSchema, 'params'),
  validate(productSchema),
  authenticateToken,
  api.updateProduct.bind(api)
);

router.get(
  '/',
  authenticateToken,
  api.getProducts.bind(api)
);

router.get(
  '/:id',
  validate(idSchema, 'params'),
  authenticateToken,
  api.getProductById.bind(api)
);

module.exports = router;
