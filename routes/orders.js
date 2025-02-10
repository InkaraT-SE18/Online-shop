const express = require("express");
const { createOrder, getUserOrders, confirmOrder } = require("../controllers/orderController");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();
router.post("/create", verifyToken, createOrder);
router.get("/", verifyToken, getUserOrders);
router.put("/:id/confirm", confirmOrder);
module.exports = router;
