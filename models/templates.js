const mongoose = require("mongoose");
const templateSchema = new mongoose.Schema({
  user_id: String,
  template_size: Number,
  grid_layout: [Number],
  background_color: String,
  date_properties: {
    text: String,
    color: String,
    fontSize: String,
  },
  custom_text_properties: {
    text: String,
    color: String,
    fontSize: String,
  },
  products: [
    {
      id: String,
      nameTr: String,
      nameDe: String,
      oldPrice: Number,
      newPrice: Number,
      unitPrice: String,
      saving: String,
      packageSize: String,
      image: String,
      logo: String,
      isHalal: Boolean,
    },
  ],
  pdf_url: String,
  image_url: String,
  created_at: { type: Date, default: Date.now },
});

const Template = mongoose.model("Template", templateSchema);
module.exports = Template;
