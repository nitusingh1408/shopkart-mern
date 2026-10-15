const Product = require("../models/product.model");

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      image,
      stock
    } = req.body;

    if (!name || !description || !price || !category || !image || stock === undefined) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        message: "Price must be greater than 0"
      });
    }

    if (stock < 0) {
      return res.status(400).json({
        message: "Stock cannot be negative"
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      image,
      stock
    });

    res.status(201).json(product);

  } catch (error) {
    res.status(500).json({
      message: "Server error"
    });
  }
};


const getProducts = async (req, res) => {
  try {
    const { search, category } = req.query;

    const filter = {};

    if (search) {
      filter.name = {
        $regex: search,
        $options: "i"
      };
    }

    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter);

    res.json({
      success: true,
      count: products.length,
      products
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error"
    });
  }
};


const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json(product);

  } catch (error) {
    res.status(400).json({
      message: "Invalid product ID"
    });
  }
};


module.exports = {
  createProduct,
  getProducts,
  getProduct
};