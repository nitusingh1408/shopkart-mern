const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

const addToWishlist = async (req, res) => {
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

    if (customer.wishlist.includes(productId)) {
      return res.status(409).json({
        message: "Product already in wishlist"
      });
    }

    customer.wishlist.push(productId);

    await customer.save();

    res.status(201).json({
      success: true,
      message: "Product added to wishlist"
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error"
    });
  }
};


const getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id)
      .populate({
        path: "wishlist",
        select: "name price category image stock"
      });

    res.json({
      success: true,
      count: customer.wishlist.length,
      wishlist: customer.wishlist
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error"
    });
  }
};


const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: "Invalid product ID"
      });
    }

    const customer = await Customer.findById(req.user._id);

    const productExists = customer.wishlist.some(
      (id) => id.toString() === productId
    );

    if (!productExists) {
      return res.status(404).json({
        message: "Product not in wishlist"
      });
    }

    customer.wishlist = customer.wishlist.filter(
      (id) => id.toString() !== productId
    );

    await customer.save();

    res.json({
      success: true,
      message: "Product removed from wishlist"
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error"
    });
  }
};


module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist
};