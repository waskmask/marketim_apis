const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const appUserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    fullName: { type: String },
    password: { type: String, required: true },
    companyName: { type: String },
    companyAddress: {
      street: { type: String },
      house_no: { type: String },
      city: { type: String },
      postcode: { type: String },
    },
    companyTxn: { type: String },
    companyLogo: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    role: {
      type: String,
      enum: ["app_user"],
      required: true,
    },
    emailVerified: { type: Boolean, default: false },
    resetPasswordCode: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

const AppUser = mongoose.model("App_User", appUserSchema);
module.exports = AppUser;
