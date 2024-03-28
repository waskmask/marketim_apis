// categoryRoutes.js
const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController"); // Adjust the path to your controller
const authenticateToken = require("../middlewares/authMiddleware");
// POST request to create a new category
router.post(
  "/admin/add-category",
  authenticateToken,
  categoryController.createCategory
);

router.get(
  "/admin/categories",
  authenticateToken,
  categoryController.getCategories
);
// categoryRoutes.js
router.patch(
  "/admin/update-category-status",
  authenticateToken,
  categoryController.updateCategoryStatus
);
router.patch(
  "/admin/update-category",
  authenticateToken,
  categoryController.updateCategory
);

module.exports = router;
