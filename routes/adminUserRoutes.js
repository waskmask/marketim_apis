const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();

// Signup route
router.post("/admin/signup", userController.signup);

// Login route
router.post("/admin/login", userController.login);

router.post("/admin/forgot-password", userController.forgotPassword);
router.post("/admin/reset-password", userController.resetPassword);

// logout
router.post("/admin/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Could not log out, please try again." });
    }
    res.clearCookie("loginToken"); // Ensure this is the name of your JWT cookie
    res.clearCookie("connect.sid"); // Clearing the session cookie
    res.json({ message: "Logout successful" });
  });
});

// Export the router
module.exports = router;
