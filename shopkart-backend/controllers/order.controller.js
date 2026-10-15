
const mongoose = require("mongoose");
const crypto = require("crypto");

const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const razorpay = require("../config/razorpay");

const validateAddress = (address) => {
  if (!address || typeof address !== "object") {
    return "Shipping address is required";
  }

  const fields = [
    "fullName",
    "phone",
    "addressLine1",
    "city",
    "state",
    "pincode"
  ];

  for (const field of fields) {
    if (
      typeof address[field] !== "string" ||
      address[field].trim() === ""
    ) {
      return `${field} is required`;
    }
  }

  if (!/^[0-9]{10}$/.test(address.phone.trim())) {
    return "Phone must contain exactly 10 digits";
  }

  if (!/^[0-9]{6}$/.test(address.pincode.trim())) {
    return "Pincode must contain exactly 6 digits";
  }

  return null;
};

const createPaymentOrder = async (req, res) => {
  let shopKartOrder;

  try {
    const addressError = validateAddress(req.body.shippingAddress);

    if (addressError) {
      return res.status(400).json({
        success: false,
        message: addressError
      });
    }

    const customer = await Customer.findById(req.user._id);

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Customer not found"
      });
    }

    if (!customer.cart || customer.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty"
      });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of customer.cart) {
      if (!cartItem.product) {
        return res.status(400).json({
          success: false,
          message: "Invalid product in cart"
        });
      }

      const product = await Product.findById(cartItem.product);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "A product in your cart no longer exists"
        });
      }

      const quantity = Number(cartItem.quantity);

      if (
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > product.stock
      ) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`
        });
      }

      const price = Number(product.price);

      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid price for ${product.name}`
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price,
        quantity,
        image: product.image || ""
      });

      totalAmount += price * quantity;
    }

    totalAmount = Math.round((totalAmount + Number.EPSILON) * 100) / 100;

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Order total must be greater than zero"
      });
    }

    shopKartOrder = await Order.create({
      user: customer._id,
      items: orderItems,
      shippingAddress: {
        fullName: req.body.shippingAddress.fullName.trim(),
        phone: req.body.shippingAddress.phone.trim(),
        addressLine1: req.body.shippingAddress.addressLine1.trim(),
        city: req.body.shippingAddress.city.trim(),
        state: req.body.shippingAddress.state.trim(),
        pincode: req.body.shippingAddress.pincode.trim()
      },
      totalAmount,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT"
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: shopKartOrder._id.toString()
    });

    shopKartOrder.razorpayOrderId = razorpayOrder.id;
    await shopKartOrder.save();

    return res.status(201).json({
      success: true,
      message: "Payment order created",
      shopKartOrderId: shopKartOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    // Do not leave an unusable pending order if Razorpay order creation failed.
    if (shopKartOrder && !shopKartOrder.razorpayOrderId) {
      await Order.findByIdAndDelete(shopKartOrder._id).catch(() => {});
    }

    console.error("Create payment order error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not create payment order"
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const {
      shopKartOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(shopKartOrderId) ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid payment details"
      });
    }

    const order = await Order.findOne({
      _id: shopKartOrderId,
      user: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (order.paymentStatus === "PAID") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        order
      });
    }

    if (
      !order.razorpayOrderId ||
      order.razorpayOrderId !== razorpay_order_id
    ) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order ID does not match"
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
      .digest("hex");

    const received = Buffer.from(razorpay_signature, "hex");
    const expected = Buffer.from(expectedSignature, "hex");

    if (
      received.length !== expected.length ||
      !crypto.timingSafeEqual(received, expected)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature"
      });
    }

    // A valid signature must also correspond to a captured payment.
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (
      payment.order_id !== order.razorpayOrderId ||
      payment.status !== "captured" ||
      payment.amount !== Math.round(order.totalAmount * 100) ||
      payment.currency !== "INR"
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment is not captured or does not match this order"
      });
    }

    const customer = await Customer.findById(req.user._id);

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Customer not found"
      });
    }

    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;

    await order.save();

    customer.cart = [];
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified and order placed",
      order
    });
  } catch (error) {
    console.error("Verify payment error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not verify payment"
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not fetch orders"
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID"
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    return res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not fetch order"
    });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById
};