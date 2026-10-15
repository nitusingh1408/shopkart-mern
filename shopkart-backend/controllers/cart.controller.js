
const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

const getPopulatedCart = async (customer) => {
  await customer.populate({
    path: "cart.product",
    select: "name description price category image stock"
  });

  return customer.cart
    .filter((item) => item.product)
    .map((item) => ({
      product: item.product,
      quantity: item.quantity
    }));
};

// POST /cart/:productId
const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: "Invalid product ID"
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    const customer = await Customer.findById(req.user._id);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }

    const item = customer.cart.find(
      (entry) => entry.product.toString() === productId
    );

    const newQuantity = item ? item.quantity + 1 : 1;

    if (newQuantity > product.stock) {
      return res.status(400).json({
        message: "Requested quantity exceeds available stock"
      });
    }

    if (item) {
      item.quantity = newQuantity;
    } else {
      customer.cart.push({
        product: product._id,
        quantity: 1
      });
    }

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: await getPopulatedCart(customer)
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({
      message: "Server error"
    });
  }
};

// GET /cart
const getCart = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }

    return res.status(200).json({
      success: true,
      cart: await getPopulatedCart(customer)
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({
      message: "Server error"
    });
  }
};

// PATCH /cart/:productId
const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: "Invalid product ID"
      });
    }

    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return res.status(400).json({
        message: "Quantity must be an integer of at least 1"
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        message: "Requested quantity exceeds available stock"
      });
    }

    const customer = await Customer.findById(req.user._id);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }

    const item = customer.cart.find(
      (entry) => entry.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        message: "Product not in cart"
      });
    }

    item.quantity = quantity;
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Quantity updated",
      cart: await getPopulatedCart(customer)
    });
  } catch (error) {
    console.error("Update cart error:", error);
    return res.status(500).json({
      message: "Server error"
    });
  }
};

// DELETE /cart/:productId
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: "Invalid product ID"
      });
    }

    const customer = await Customer.findById(req.user._id);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }

    const exists = customer.cart.some(
      (item) => item.product.toString() === productId
    );

    if (!exists) {
      return res.status(404).json({
        message: "Product not in cart"
      });
    }

    customer.cart = customer.cart.filter(
      (item) => item.product.toString() !== productId
    );

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart: await getPopulatedCart(customer)
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    return res.status(500).json({
      message: "Server error"
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart
};