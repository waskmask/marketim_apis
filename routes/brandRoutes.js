const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brandController");
const authenticateToken = require("../middlewares/authMiddleware");
const upload = require("../middlewares/multerConfig"); // Ensure this is the correct path to your multer configuration

// Route to create a new brand with image upload
router.post(
  "/admin/add-brand",
  authenticateToken,
  upload.single("brandLogo"),
  brandController.createBrand
);

router.get("/admin/brands", authenticateToken, brandController.getBrands);

router.patch(
  "/admin/update-brand",
  authenticateToken,
  upload.single("brandLogo"),
  brandController.updateBrand
);

router.patch(
  "/admin/update-brand-status",
  authenticateToken,
  brandController.updateBrandStatus
);

module.exports = router;
