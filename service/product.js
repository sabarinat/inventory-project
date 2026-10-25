
const Product = require('../models/product-model');

class ProductService {
  constructor() {
    this.product = new Product();
  }

  // Get all products
  async getAllProducts() {
    return this.product.getAllProducts();
  }

  // Get product by ID
  async getProductById(id) {
    const product = await this.product.getProductById(id);

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  }

  // Add product
  async addProduct(productData) {
    return this.product.addProduct(productData);
  }

  // Update product
  async updateProduct(id, productData) {
    const existingProduct = await this.product.getProductById(id);

    if (!existingProduct) {
      throw new Error('Product not found');
    }

    return this.product.updateProduct(id, productData);
  }
}

module.exports = ProductService;
