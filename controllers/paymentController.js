const Order = require("../models/orders");
const Payment = require("../models/payment");

exports.processPayment = async (req, res) => {
  const { cardNumber, cardHolder, expiryDate, cvv, orderId, method = "card" } = req.body;

  try {
    const userId = req.user.id;
    const order = await Order.findById(orderId);
    
    console.log("Order found:", order); 

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!/^\d{16}$/.test(cardNumber)) {
      return res.status(400).json({ message: "Invalid card number." });
    }
    if (!/^[a-zA-Z\s]+$/.test(cardHolder)) {
      return res.status(400).json({ message: "Invalid owner name." });
    }
    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      return res.status(400).json({ message: "Invalid card expiration date." });
    }
    if (!/^\d{3}$/.test(cvv)) {
      return res.status(400).json({ message: "Invalid CVV code." });
    }

    // Проверяем метод оплаты
    const validMethods = ["card", "paypal"];
    if (!validMethods.includes(method)) {
      return res.status(400).json({ message: "Invalid payment method." });
    }

    if (order.status !== "confirmed") {
      order.status = "confirmed";
      await order.save();
    }

    const payment = new Payment({
      order: orderId,
      user: userId,
      amount: order.totalPrice,
      method,
      status: "completed",
    });

    await payment.save();
    order.status = "completed";
    await order.save();

    res.json({ message: "Payment successful", payment });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ message: "Payment processing failed" });
  }
};
