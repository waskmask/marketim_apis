const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multerConfig");
const productController = require("../controllers/productController");
const authenticateToken = require("../middlewares/authMiddleware");

// Route to create a new product
router.post(
  "/admin/add-product",
  authenticateToken,
  upload.array("images", 10),
  productController.createProduct
);

// Route to get all products
router.get("/admin/products", authenticateToken, productController.getProducts);

// Route to get a single product
router.get("/admin/product/:id", productController.getProduct);

// Add a route for updating a product
router.patch("/admin/product/:id", productController.updateProduct);
router.delete("/admin/product/:id", productController.deleteProduct);

module.exports = router;
