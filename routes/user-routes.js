
const express = require('express');
const APIController = require('../common/api-handler');
const {authenticateToken} = require('../common/jwt-ops');
const {
  userSchema,
  idSchema,
  validate
} = require('../validation/api-validation');

const router = express.Router();
const api = new APIController();

router.post(
  '/',  validate(userSchema), api.addUser.bind(api)
);

router.put(
  '/:id',
  validate(idSchema, 'params'),
  validate(userSchema),
  api.updateUser.bind(api)
);

router.get(
  '/',
  authenticateToken,
  api.getUsers.bind(api)
);

router.get(
  '/:id',
  validate(idSchema, 'params'),
  authenticateToken,
  api.getUserById.bind(api)
);

router.post(
  '/login',
  api.login.bind(api)
);

module.exports = router;
