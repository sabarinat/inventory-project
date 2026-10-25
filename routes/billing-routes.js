
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../common/jwt-ops");

const APIController = require("../common/api-handler");
const apiController = new APIController();
var { validate, createBillSchema, getBillByIdSchema, updatePaidStatusSchema } = require("../validation/api-validation");

router.post("/", validate(createBillSchema), authenticateToken,  apiController.createBill.bind(apiController));

router.get("/", validate(getBillByIdSchema), authenticateToken, apiController.getAllBills.bind(apiController));

router.get("/:id", validate(getBillByIdSchema), authenticateToken, apiController.getBillById.bind(apiController));

router.patch("/:id/paid-status", validate(updatePaidStatusSchema), authenticateToken, apiController.updatePaidStatus.bind(apiController));

module.exports = router;
