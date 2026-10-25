
const User = require('../models/user-model');
const {generateToken} = require('../common/jwt-ops');
const bcrypt = require("bcrypt");

class UserService {
  constructor() {
    this.user = new User();
  }

  // Get all users
  async getAllUsers() {
    return this.user.getAllUsers();
  }

  // Get user by ID
  async getUserById(id) {
    const user = await this.user.getUserById(id);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  // Add user
  async addUser(userData) {
    userData.password = await this.hashPassword(userData.password);
    return this.user.addUser(userData);
  }

  // Update user
  async updateUser(id, userData) {
    const existingUser = await this.user.getUserById(id);

    if (!existingUser) {
      throw new Error('User not found');
    }

    return this.user.updateUser(id, userData);
  }

  async hashPassword(password) {
    return await bcrypt.hash(password, 12);
  }

  async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
  
  async login(email, password) {
    // 1. Get user by email
    const user = await this.user.getUserByMail(email);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // 2. Compare password with stored hash
    const isPasswordValid = await this.comparePassword(
      password,
      user.password
    );

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // 3. Generate JWT token
    const jwtToken = await generateToken(
      {
        id: String(user.id),
        email: user.mail,
      });

    // 4. Return token with user details
    const { password: _, ...userDetails } = user;

    return {
      jwtToken,
      user: userDetails,
    };
  }

}

module.exports = UserService;
