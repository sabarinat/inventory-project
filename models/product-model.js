
const pool = require('../common/connect-database');

 class Product {
  // Get all products
  async getAllProducts() {
    const [rows] = await pool.execute(
      'SELECT id, name, count, sell_price as sellPrice, buy_price as buyPrice FROM products'
    );

    return rows;
  }

  // Add a new product
  async addProduct({ name, count, sellPrice, buyPrice }) {
    const [result] = await pool.execute(
      `INSERT INTO products (name, count, sell_price, buy_price)
       VALUES (?, ?, ?, ?)`,
      [name, count, sellPrice, buyPrice]
    );

    return {
      id: result.insertId,
      name,
      count,
      sellPrice,
      buyPrice
    };
  }

  // Get product by ID
  async getProductById(id) {
    const [rows] = await pool.execute(
      'SELECT id, name, count, sell_price as sellPrice, buy_price as buyPrice FROM products WHERE id = ?',
      [id]
    );

    return rows[0] || null;
  }

  
async updateProduct(id, { name, count, sellPrice, buyPrice }) {
  const [result] = await pool.execute(
    `UPDATE products
     SET name = ?, count = ?, sell_price = ?, buy_price = ?
     WHERE id = ?`,
    [name, count, sellPrice, buyPrice, id]
  );

  if (result.affectedRows === 0) {
    // Check whether the product exists but values were unchanged
    const existing = await this.getProductById(id);

    if (!existing) {
      return null;
    }
  }

  return this.getProductById(id);
}

 async updateProductCount(id, updatedCount, conection) {
  const poolToUse = conection || pool;
  const [result] = await poolToUse.execute(
    `UPDATE products
     SET count = count - ?
     WHERE id = ? AND count >= ?`,
    [updatedCount, id, updatedCount]
  );

  return { productId: id, updated: result.affectedRows > 0 };
}

}

module.exports = Product;


