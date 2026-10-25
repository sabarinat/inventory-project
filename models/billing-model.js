
const pool = require('../common/connect-database');
const ProductModel = require('../models/product-model');

class BillingModel {

    constructor() {
        this.productModel = new ProductModel();
    }

async createBill(userId, products, isTaxApplied, taxAppliedPercent, paidStatus = 1) {
  const connection = await pool.getConnection();
  let transactionStarted = false;

  try {
    if (!products?.length) {
      throw new Error("At least one product is required");
    }



    await connection.beginTransaction();
    transactionStarted = true;

    // 1. Validate products before changing stock
    let subtotal = 0;

     const items = products.map((product) => {
      const count = Number(product.count);
      const unitPrice = Number(product.unitPrice);

      if (
        !Number.isInteger(count) ||
        count <= 0 ||
        !Number.isFinite(unitPrice) ||
        unitPrice < 0
      ) {
        throw new Error("Invalid product quantity or price");
      }

      const itemTotal = Number((count * unitPrice).toFixed(2));
      subtotal += itemTotal;

      return {
        product_id: product.id,
        count,
        unit_price: unitPrice,
        total_cost: itemTotal,
      };
    });

    for (const item of items) {
      const result = await this.productModel.updateProductCount(
        item.product_id,
        item.count,
        connection
      );

      if (!result.updated) {
        throw new Error(
          `Product ID ${item.product_id} not found or insufficient stock`
        );
      }
    }

   

    subtotal = Number(subtotal.toFixed(2));

    // 2. Update stock using the same transaction connection

    // 3. Calculate bill-level tax
    const taxPercent = Number(taxAppliedPercent ?? 0);

    if (
      !Number.isFinite(taxPercent) ||
      taxPercent < 0 ||
      taxPercent > 100
    ) {
      throw new Error("Invalid tax percentage");
    }

    const taxAmount = isTaxApplied
      ? Number((subtotal * taxPercent / 100).toFixed(2))
      : 0;

    const grandTotal = Number((subtotal + taxAmount).toFixed(2));

    // 4. Insert billing record
    const [billResult] = await connection.execute(
      `INSERT INTO billing
       (user_id, subtotal, tax_applied_percent,
        is_tax_applied, tax_amount, total_cost, paid_status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        subtotal,
        isTaxApplied ? taxPercent : 0,
        Boolean(isTaxApplied),
        taxAmount,
        grandTotal,
        paidStatus,
      ]
    );

    const billingId = billResult.insertId;

    // 5. Insert billing items
    for (const item of items) {
      await connection.execute(
        `INSERT INTO billing_items
         (billing_id, product_id, count, unit_price, total_cost)
         VALUES (?, ?, ?, ?, ?)`,
        [
          billingId,
          item.product_id,
          item.count,
          item.unit_price,
          item.total_cost,
        ]
      );
    }

    // 6. Commit all changes
    await connection.commit();
    transactionStarted = false;

    return {
      billing_id: billingId,
      subtotal,
      is_tax_applied: Boolean(isTaxApplied),
      tax_applied_percent: isTaxApplied ? taxPercent : 0,
      tax_amount: taxAmount,
      total_cost: grandTotal,
      paid_status: paidStatus,
      items,
    };
  } catch (error) {
    // Roll back stock updates and billing inserts
    if (transactionStarted) {
      await connection.rollback();
    }

    throw error;
  } finally {
    // Always release the connection
    connection.release();
  }
}

async getAllBills() {
  const [rows] = await pool.execute(
    `SELECT
       id, user_id AS userId, subtotal, is_tax_applied AS isTaxApplied, tax_applied_percent AS taxAppliedPercent,
       tax_amount AS taxAmount, total_cost AS totalCost, paid_status AS paidStatus
     FROM billing 
     ORDER BY created_at DESC`
  );

  return rows;
}

async getBillById(id) {
  const [rows] = await pool.execute(
    `SELECT
       b.*,
       u.name AS user_name,
       bi.id AS billing_item_id,
       bi.product_id,
       p.name AS product_name,
       bi.count,
       bi.unit_price,
       bi.total_cost AS item_total
     FROM billing b
     JOIN users u ON b.user_id = u.id
     JOIN billing_items bi ON b.id = bi.billing_id
     JOIN products p ON bi.product_id = p.id
     WHERE b.id = ?
     ORDER BY bi.id ASC`,
    [id]
  );

  if (rows.length === 0) {
    return null;
  }

  // Return one bill containing multiple products
  const bill = {
    id: rows[0].id,
    userId: rows[0].user_id,
    userName: rows[0].user_name,
    subtotal: rows[0].subtotal,
    isTaxApplied: rows[0].is_tax_applied,
    taxAppliedPercent: rows[0].tax_applied_percent,
    taxAmount: rows[0].tax_amount,
    totalCost: rows[0].total_cost,
    paidStatus: rows[0].paid_status,
    createdAt: rows[0].created_at,
    products: rows.map((row) => ({
      billingitemId: row.billing_item_id,
      productId: row.product_id,
      productName: row.product_name,
      count: row.count,
      unitPrice: row.unit_price,
      totalCost: row.item_total,
    })),
  };

  return bill;
}

async updatePaidStatus(id, paid_status) {
  if (![1, 2].includes(Number(paid_status))) {
    throw new Error("Invalid paid status. Use 1 for Pending or 2 for Paid.");
  }

  const [result] = await pool.execute(
    `UPDATE billing
     SET paid_status = ?
     WHERE id = ?`,
    [Number(paid_status), id]
  );

  return result.affectedRows > 0;
}

}

module.exports = BillingModel;
