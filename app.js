require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");

// Create the server
const app = express();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Middleware

const corsOptions = {
  origin: [
    "http://localhost:5000",
    "https://marketim.app",
    "https://admin.marketim.app",
    "https://marketim.de",
  ],
  credentials: true, // Considering you might be using credentials
  methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days in milliseconds
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  })
);

// Set EJS as the view engine
app.set("view engine", "ejs");

// Serve static files
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res) => {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Methods", "GET");
    },
  })
);

const adminUserRoutes = require("./routes/adminUserRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const brandRoutes = require("./routes/brandRoutes");
const allDataAnalysisRoutes = require("./routes/allDataAnalysisRoutes");

app.use(adminUserRoutes);
app.use(categoryRoutes);
app.use(brandRoutes);
app.use(productRoutes);
app.use(allDataAnalysisRoutes);

// app routes
const appUserRoutes = require("./routes/appUserRoutes");
app.use(appUserRoutes);

app.use((error, req, res, next) => {
  console.error(error.stack);

  // Handle Mongoose validation errors
  if (error.name === "ValidationError") {
    return res.status(400).json({ message: error.message });
  }

  // Prevent setting headers after they are sent to the client
  if (!res.headersSent) {
    res.status(500).send("Internal Server Error");
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
