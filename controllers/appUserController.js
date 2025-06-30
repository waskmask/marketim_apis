require("dotenv").config(); // Ensure this is at the top to load environment variables
const AppUser = require("../models/appUser"); // Consistent User model import
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const userController = {
  signup: async (req, res) => {
    try {
      const { email, password } = req.body;
      const existingUser = await AppUser.findOne({ email });

      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const result = await AppUser.create({
        email,
        password: hashedPassword,
        role: "app_user",
      });

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error("JWT secret is not defined in environment variables");
      }

      const token = jwt.sign(
        { email: result.email, id: result._id },
        jwtSecret,
        { expiresIn: "30d" }
      );

      res.status(201).json({ result, token });
    } catch (error) {
      console.error("Error during signup:", error.message); // Log the error
      res
        .status(500)
        .json({ message: "Something went wrong", error: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const existingUser = await AppUser.findOne({ email });

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

      res.status(200).json({ result: existingUser, token });
      console.log("Login success");
    } catch (error) {
      res.status(500).json({ message: "Something went wrong" });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await AppUser.findOne({ email });

      if (!user) {
        return res.status(404).send("User not found.");
      }

      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expirationTime = 3600000; // 1 hour in milliseconds

      user.resetPasswordCode = resetCode;
      user.resetPasswordExpires = Date.now() + expirationTime;

      await user.save();

      // Email setup
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        requireTLS: false, // Force the use of TLS
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: `"Marketim" <${process.env.SMTP_USER}>`, // sender address
        to: user.email, // list of receivers
        subject: "Password Reset Code", // Subject line
        text: `Your password reset code is: ${resetCode}`, // plain text body
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully.");
        res.send("A reset code has been sent to your email.");
      } catch (emailError) {
        console.error("Error sending email:", emailError.message);
        res
          .status(500)
          .send("Error in sending the reset code. Please try again later.");
      }
    } catch (error) {
      console.error("Error during forgot password process:", error.message);
      res
        .status(500)
        .send("Error in processing your request. Please try again later.");
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { email, resetCode, newPassword } = req.body;
      const user = await AppUser.findOne({
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
  updateCompanyProfile: async (req, res) => {
    try {
      const userId = req.user?.id; // Extracted from decoded JWT
      if (!userId) {
        return res.status(401).json({ message: "Nicht autorisiert" });
      }

      const { companyName, street, house_no, city, postcode, companyTxn } =
        req.body;

      const user = await AppUser.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "Benutzer nicht gefunden" });
      }

      user.companyName = companyName || user.companyName;
      user.companyTxn = companyTxn || user.companyTxn;
      user.companyAddress = {
        street: street || user.companyAddress.street,
        house_no: house_no || user.companyAddress.house_no,
        city: city || user.companyAddress.city,
        postcode: postcode || user.companyAddress.postcode,
      };

      await user.save();

      res.status(200).json({
        message: "Firmenprofil erfolgreich gespeichert",
        user,
      });
    } catch (error) {
      console.error("Fehler beim Speichern des Firmenprofils:", error);
      res.status(500).json({ message: "Serverfehler beim Speichern" });
    }
  },
  uploadCompanyImages: async (req, res) => {
    try {
      const user = await AppUser.findById(req.user.id);
      if (!user)
        return res.status(404).json({ message: "Benutzer nicht gefunden" });

      if (req.files.coverImage) {
        user.coverImage = req.files.coverImage[0].filename;
      }
      if (req.files.companyLogo) {
        user.companyLogo = req.files.companyLogo[0].filename;
      }

      await user.save();

      res.status(200).json({ message: "Bilder erfolgreich hochgeladen", user });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ message: "Fehler beim Speichern der Bilder" });
    }
  },
  getProfile: async (req, res) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Nicht autorisiert" });
      }

      const user = await AppUser.findById(userId).select(
        "-password -resetPasswordCode -resetPasswordExpires"
      );

      if (!user) {
        return res.status(404).json({ message: "Benutzer nicht gefunden" });
      }

      res.status(200).json({ user });
    } catch (error) {
      console.error("Fehler beim Abrufen des Profils:", error);
      res
        .status(500)
        .json({ message: "Serverfehler beim Abrufen des Profils" });
    }
  },
};

module.exports = userController;
