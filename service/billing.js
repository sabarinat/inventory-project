
const BillingModel = require("../models/billing-model");

class BillingService {
  constructor() {
    this.billingModel = new BillingModel();
  }
  async createBill(userId, products, isTaxApplied, taxAppliedPercent, paidStatus = 1) {
    return await this.billingModel.createBill(
      userId,
      products,
      isTaxApplied,
      taxAppliedPercent,
      paidStatus
    );
  }

  async getAllBills() {
    return await this.billingModel.getAllBills();
  }

  async getBillById(id) {
    return await this.billingModel.getBillById(id);
  }

  async updatePaidStatus(id, paidStatus) {
    return await this.billingModel.updatePaidStatus(id, paidStatus);
  }
}

module.exports = BillingService;
