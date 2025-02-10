const Order = require("../models/orders");
const Product = require("../models/Product");
const User = require("../models/users"); 

exports.createOrder = async (req, res) => {
  try {
    const user = req.user; 
    const { products } = req.body; 

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "Cart is empty." });
    }

    let totalPrice = 0;
    const productDetails = [];

    for (const item of products) {
      const productInDb = await Product.findById(item.product);
      if (!productInDb) {
        return res.status(404).json({ message: `Product with ID ${item.product} not found` });
      }

      const orderTotalPrice = productInDb.price * item.quantity;
      totalPrice += orderTotalPrice;

      productDetails.push({
        product: productInDb._id,
        quantity: item.quantity,
      });
    }

    const newOrder = new Order({
      user: user._id,
      products: productDetails,
      totalPrice: totalPrice,
    });

    const savedOrder = await newOrder.save(); 

    res.status(201).json({ message: "Order created successfully", order: savedOrder });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const user = req.user; 
    const orders = await Order.find({ user: user._id }).populate("products.product");

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error getting orders:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

exports.confirmOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.status !== "pending") {
      return res.status(400).json({ message: "Order cannot be confirmed" });
    }

    order.status = "confirmed";
    await order.save();

    res.json({ message: "Order confirmed successfully", order });
  } catch (error) {
    console.error("Error confirming order:", error);
    res.status(500).json({ message: "Server error" });
  }
};
