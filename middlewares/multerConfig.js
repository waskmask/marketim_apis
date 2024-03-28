// multerConfig.js
const multer = require("multer");
const path = require("path");

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "D:/MarktPrint/backend_apis/uploads/"); // Adjust the path as necessary
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Naming the file
  },
});

// File filter for validating file types
const fileFilter = (req, file, cb) => {
  if (["image/png", "image/jpeg", "image/jpg"].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file format"), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload; // Export the configured Multer instance
