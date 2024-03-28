require("dotenv").config(); // Ensure this is at the top to load environment variables
const User = require("../models/adminUser"); // Consistent User model import
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userController = {
  signup: async (req, res) => {
    try {
      const { email, password, fullName, role } = req.body; // Include fullName and role
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const result = await User.create({
        email,
        password: hashedPassword,
        fullName,
        role,
      });

      // Use an environment variable for the JWT secret (process.env.JWT_SECRET)
      const token = jwt.sign(
        { email: result.email, id: result._id },
        process.env.JWT_SECRET || process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );

      res.status(201).json({ result, token });
    } catch (error) {
      res.status(500).json({ message: "Something went wrong" });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const existingUser = await User.findOne({ email });

      if (!existingUser) {
        return res.status(404).json({ message: "User doesn't exist" });
      }

      const isPasswordCorrect = await bcrypt.compare(
        password,
        existingUser.password
      );

      if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Save user info in session
      req.session.user = {
        id: existingUser._id,
        email: existingUser.email,
        role: existingUser.role,
      };
      // Check if user status is 'active'
      if (existingUser.status !== "active") {
        return res.status(401).json({
          message: "User account is not active. Please contact support.",
        });
      }

      // Proceed with creating the JWT and login process since the user is active
      const token = jwt.sign(
        {
          email: existingUser.email,
          id: existingUser._id,
          fullName: existingUser.fullName, // Make sure the property name matches the database schema
          role: existingUser.role,
          status: existingUser.status,
        },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );

      // Set the token in an HTTP-only cookie
      res.cookie("loginToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
      res.status(200).json({ result: existingUser, token });
      console.log("Login success");
    } catch (error) {
      res.status(500).json({ message: "Something went wrong" });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).send("User not found.");
      }

      // Generate a 6-digit code
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expirationTime = 3600000; // 1 hour in milliseconds

      user.resetPasswordCode = resetCode;
      user.resetPasswordExpires = Date.now() + expirationTime; // Set code to expire in 1 hour

      await user.save();

      // Here you would send the resetCode to the user's email or phone
      // For example: sendResetCodeEmail(user.email, resetCode);

      res.send("A reset code has been sent to your email.");
    } catch (error) {
      res.status(500).send("Error in sending the reset code.");
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { email, resetCode, newPassword } = req.body;
      const user = await User.findOne({
        email,
        resetPasswordExpires: { $gt: Date.now() }, // Checks if the code is not expired
      });

      if (!user || user.resetPasswordCode !== resetCode) {
        return res.status(400).send("Invalid or expired reset code.");
      }

      // Hash the new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      user.password = hashedNewPassword; // Set the hashed new password
      user.resetPasswordCode = undefined; // Clear the reset code
      user.resetPasswordExpires = undefined; // Clear the expiration

      await user.save();

      res.send("Password has been reset successfully.");
    } catch (error) {
      res.status(500).send("Error resetting password.");
    }
  },
};

module.exports = userController;
