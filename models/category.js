const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model("Category", categorySchema); // The model name should typically match the collection you're working with
module.exports = Category;
