const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { verifyAdmin } = require("../middleware/admin");
const upload = require("../middleware/upload");

const AuthController = require("../controllers/authController");
const OrderController = require("../controllers/orderController");
const ProductController = require("../controllers/productController");

router.get("/users", verifyToken, verifyAdmin, AuthController.getAllUsers);
router.delete("/users/:id", verifyToken, verifyAdmin, AuthController.deleteUser);
router.put("/users/:id", verifyToken, verifyAdmin, AuthController.updateUserAttribute);


router.post(
  "/cars/add",
  verifyToken,
  verifyAdmin,
  upload.single("img"), 
  carController.addCar
);

router.put(
  "/cars/:id/image",
  verifyToken,
  verifyAdmin,
  upload.single("img"), 
  carController.updateCarImage
);

module.exports = router;