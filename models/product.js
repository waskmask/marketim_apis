const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new mongoose.Schema(
  {
    title: {
      en: { type: String },
      de: { type: String },
      tr: { type: String },
    },
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
    ],
    brand: [
      {
        type: Schema.Types.ObjectId,
        ref: "Brand",
      },
    ],
    thumbnail: { type: String },
    images: [{ type: String }],
    weight: {
      unit_type: { type: String, required: true }, // Specify type and required here
      unit_vol: { type: Number, required: true }, // Use Number for volumes/weights and specify type and required here
    },
    description: { type: String },
    isHalal: { type: Boolean, default: false },
    organic: { type: Boolean, default: false },
    vegan: { type: Boolean, default: false },
    vegetarian: { type: Boolean, default: false },
    lactose_free: { type: Boolean, default: false },
    gluten_free: { type: Boolean, default: false },
    handelClass: { type: String },
    base_price: { type: String },
    unit_price: { type: String },
    package_type: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    origin: { type: String },
    deposit: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Document-level validation for 'title'
productSchema.pre("validate", function (next) {
  if (!this.title.en && !this.title.de && !this.title.tr) {
    this.invalidate(
      "title",
      "At least one of `en`, `tr` or `de` must be provided."
    );
  }
  next();
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
