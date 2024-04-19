const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const Category = require("../models/category");
const Brand = require("../models/brand");

router.get("/admin/products/count", async (req, res) => {
  try {
    const count = (await Product.countDocuments()) || 0;
    res.json(count);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/admin/categories/count", async (req, res) => {
  try {
    const count = (await Category.countDocuments()) || 0;
    res.json(count);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/admin/brands/count", async (req, res) => {
  try {
    const count = (await Brand.countDocuments()) || 0;
    res.json(count);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
