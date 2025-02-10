const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/verify-otp", authController.verifyOTP);
router.get("/profile", verifyToken, authController.getProfile);
router.put("/profile/update", verifyToken, authController.updateProfile);
module.exports = router;