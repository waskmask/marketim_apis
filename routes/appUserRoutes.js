const express = require("express");
const userController = require("../controllers/appUserController");
const authenticateToken = require("../middlewares/authMiddleware");
const upload = require("../middlewares/multerConfig"); // <-- import multer config
const router = express.Router();

// Signup/Login
router.post("/app/signup", userController.signup);
router.post("/app/login", userController.login);
router.post("/app/forgot-password", userController.forgotPassword);
router.post("/app/reset-password", userController.resetPassword);

// ✅ Get profile
router.get("/app/profile", authenticateToken, userController.getProfile);

// Company profile update
router.post(
  "/app/company-profile",
  authenticateToken,
  userController.updateCompanyProfile
);

// ✅ Image upload route
router.post(
  "/app/upload-company-images",
  authenticateToken,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "companyLogo", maxCount: 1 },
  ]),
  userController.uploadCompanyImages
);

module.exports = router;
