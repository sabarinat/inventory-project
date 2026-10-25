
const pool = require('../common/connect-database');

class User {
  // Get all users
  async getAllUsers() {
    const [rows] = await pool.execute(
      `SELECT id, name, mail, role, mobile_number
       FROM users`
    );

    return rows;
  }

  // Get user by ID
  async getUserById(id) {
    const [rows] = await pool.execute(
      `SELECT id, name, mail, role, mobile_number
       FROM users
       WHERE id = ?`,
      [id]
    );

    return rows[0] || null;
  }

  async getUserByMail(mail) {
    const [rows] = await pool.execute(
      `SELECT *
       FROM users
       WHERE mail = ?`,
      [mail]
    );

    return rows[0] || null;
  }

  // Add user
  async addUser({ name, mail, role, mobileNumber, password }) {
    const [result] = await pool.execute(
      `INSERT INTO users (name, mail, role, mobile_number, password)
       VALUES (?, ?, ?, ?, ?)`,
      [name, mail, role, mobileNumber, password]
    );

    return this.getUserById(result.insertId);
  }

  // Update user
  async updateUser(id, { name, mail, role, mobile_number }) {
    const [result] = await pool.execute(
      `UPDATE users
       SET name = ?, mail = ?, role = ?, mobile_number = ?
       WHERE id = ?`,
      [name, mail, role, mobile_number, id]
    );

    if (result.affectedRows === 0) {
      const existing = await this.getUserById(id);

      if (!existing) {
        return null;
      }
    }

    return this.getUserById(id);
  }

}

module.exports = User;
