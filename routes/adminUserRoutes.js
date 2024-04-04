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
  // Destroy session
  req.session.destroy((err) => {
    if (err) {
      console.log("Error destroying session: ", err);
      return res
        .status(500)
        .send({ message: "Logout failed, please try again." });
    }

    // Clear cookies
    res.clearCookie("loginToken", { path: "/" });
    res.clearCookie("connect.sid", { path: "/" });

    // Inform the client of successful logout
    res.send({ message: "Logout successful" });
  });
});

// Export the router
module.exports = router;
