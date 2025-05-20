const express = require("express");
const userController = require("../controllers/appUserController");
const router = express.Router();

// Signup route
router.post("/app/signup", userController.signup);

// Login route
router.post("/app/login", userController.login);

router.post("/app/forgot-password", userController.forgotPassword);
router.post("/app/reset-password", userController.resetPassword);

module.exports = router;
