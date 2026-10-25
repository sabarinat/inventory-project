
const UserService = require('../service/user');
const ProductService = require('../service/product');
const BillingService = require('../service/billing');
const { sendResponse } = require('../common/common');

class APIController {
  constructor() {
    this.userService = new UserService();
    this.productService = new ProductService();
    this.billingService = new BillingService();
  }

  // ================= USER APIs =================

  async addUser(req, res) {
    try {
      const user = await this.userService.addUser(req.body);

      return sendResponse(res, 201, true, 'User created successfully', user);
    } catch (error) {
      console.error(error);

      if (error.code === 'ER_DUP_ENTRY') {
        return sendResponse(res, 409, false, 'Email already exists' );
      }

      return sendResponse(
        res, 500, false, 'Failed to create user'
      );
    }
  }

  async updateUser(req, res) {
    try {
      const id = Number(req.params.id);

      if (!Number.isSafeInteger(id) || id <= 0) {
        return sendResponse(res, 400, false, 'Invalid user ID');
      }

      const user = await this.userService.updateUser(id, req.body);

      return sendResponse(
        res, 200, true, 'User updated successfully', user
      );
    } catch (error) {
      console.error(error);

      if (error.message === 'User not found') {
        return sendResponse(res, 404, false, error.message);
      }

      if (error.code === 'ER_DUP_ENTRY') {
        return sendResponse(res, 409, false, 'Email already exists');
      }

      return sendResponse(res, 500, false, 'Failed to update user');
    }
  }

  async getUsers(req, res) {
    try {
      const users = await this.userService.getAllUsers();

      return sendResponse(
        res, 200, true, users, 'Users fetched successfully'
      );
    } catch (error) {
      console.error(error);

      return sendResponse(res, 500, false, 'Failed to fetch users');
    }
  }

  async getUserById(req, res) {
    try {
      const id = Number(req.params.id);

      if (!Number.isSafeInteger(id) || id <= 0) {
        return sendResponse(res, 400, false, 'Invalid user ID');
      }

      const user = await this.userService.getUserById(id);

      return sendResponse(
        res, 200, true, user, 'User fetched successfully'
      );
    } catch (error) {
      console.error(error);

      if (error.message === 'User not found') {
        return sendResponse(res, 404, false, error.message);
      }

      return sendResponse(res, 500, false, 'Failed to fetch user');
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const result = await this.userService.login(email, password);

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          jwtToken: result.jwtToken,
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // ================= PRODUCT APIs =================

  async addProduct(req, res) {
    try {
      const product = await this.productService.addProduct(req.body);

      return sendResponse(
        res, 201, true, 'Product created successfully', product
      );
    } catch (error) {
      console.error(error);

      return sendResponse(res, 500, false, 'Failed to create product');
    }
  }

  async updateProduct(req, res) {
    try {
      const id = Number(req.params.id);

      if (!Number.isSafeInteger(id) || id <= 0) {
        return sendResponse(res, 400, false, 'Invalid product ID');
      }

      const product = await this.productService.updateProduct(
        id,
        req.body
      );

      return sendResponse(
        res, 200, true, 'Product updated successfully', product
      );
    } catch (error) {
      console.error(error);

      if (error.message === 'Product not found') {
        return sendResponse(res, 404, false, error.message);
      }

      return sendResponse(res, 500, false, 'Failed to update product');
    }
  }

  async getProducts(req, res) {
    try {
      const products = await this.productService.getAllProducts();

      return sendResponse(
        res, 200, true, products, 'Products fetched successfully'
      );
    } catch (error) {
      console.error(error);

      return sendResponse(res, 500, false, 'Failed to fetch products');
    }
  }

  async getProductById(req, res) {
    try {
      const id = Number(req.params.id);

      if (!Number.isSafeInteger(id) || id <= 0) {
        return sendResponse(res, 400, false, 'Invalid product ID');
      }

      const product = await this.productService.getProductById(id);

      return sendResponse(
        res, 200, true, product, 'Product fetched successfully'
      );
    } catch (error) {
      console.error(error);

      if (error.message === 'Product not found') {
        return sendResponse(res, 404, false, error.message);
      }

      return sendResponse(res, 500, false, 'Failed to fetch product');
    }
  }

  async createBill(req, res, next) {
    try {
      const {products, isTaxApplied, taxAppliedPercent, paidStatus } =
        req.body;
      const userId = req.user.id;
      

      const result = await this.billingService.createBill(
        userId ,
        products,
        isTaxApplied,
        taxAppliedPercent,
        paidStatus
      );

      return res.status(201).json({
        success: true,
        message: "Bill created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllBills(req, res, next) {
    try {
      const result = await this.billingService.getAllBills();

      return res.status(200).json({
        success: true,
        message: "Bills retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBillById(req, res, next) {
    try {
      const { id } = req.params;

      const result = await this.billingService.getBillById(id);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Bill not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Bill retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePaidStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { paid_status } = req.body;

      const result = await this.billingService.updatePaidStatus(id, paid_status);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Bill not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Payment status updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = APIController;
