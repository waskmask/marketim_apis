const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    brandName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    brandLogo: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  {
    timestamps: true,
  }
);

const Brand = mongoose.model("Brand", brandSchema); // The model name should typically match the collection you're working with
module.exports = Brand;
