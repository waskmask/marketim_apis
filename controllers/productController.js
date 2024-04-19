const Product = require("../models/product");
const Category = require("../models/category");
const jimp = require("jimp");
const upload = require("../middlewares/multerConfig");
const path = require("path");

exports.createProduct = async (req, res, next) => {
  try {
    let thumbnailFilename = "";
    if (req.files && req.files.length > 0) {
      // Generate a timestamp to use for the thumbnail filename
      const timestamp = Date.now();
      thumbnailFilename = `thumbnail-${timestamp}.png`;
      const thumbnailFullPath = `uploads/${thumbnailFilename}`;

      // Load the first uploaded image
      const image = await jimp.read(req.files[0].path);

      // Resize the image to 100x100 pixels max without shrinking
      await image
        .resize(100, jimp.AUTO)
        .quality(100) // Set the quality of the image
        .writeAsync(thumbnailFullPath); // Save the thumbnail

      // Update the thumbnail path to store only the filename in the database
      req.body.thumbnail = thumbnailFilename;

      // Update image paths to store only filenames in the database
      req.body.images = req.files.map((file) => {
        // Extract and return just the filename from the full path
        return path.basename(file.path);
      });
    }

    // Now, req.body contains the filenames (not full paths) for the thumbnail and images
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();

    res.status(201).json(savedProduct);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// create a product old
// exports.createProduct = async (req, res) => {
//   try {
//     const newProduct = new Product(req.body);

//     const savedProduct = await newProduct.save();
//     res.status(201).json(savedProduct);
//   } catch (error) {
//     console.error(error); // Use console.error to log the error
//     if (error.name === "ValidationError") {
//       // Send back a more user-friendly message if needed
//       return res.status(400).json({ message: error.message });
//     }
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// get all products
exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find().populate({
      path: "categories",
      model: "Category",
      select: "_id categoryName",
    });

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// get single product
exports.getProduct = async (req, res, next) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id).populate([
      "categories",
      "brand",
    ]); // Adjust the populate method if needed

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(error); // Log the error for debugging
    next(error);
  }
};

//   update a product
exports.updateProduct = async (req, res, next) => {
  const { id } = req.params; // Assuming the product ID is passed as a URL parameter
  const updateFields = req.body; // The fields to update

  try {
    // Find the product by ID and update it with the fields provided in the request body
    const updatedProduct = await Product.findByIdAndUpdate(id, updateFields, {
      new: true, // Return the updated document
      runValidators: true, // Ensure schema validators run on update
    });

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error(error); // Log the error for debugging
    next(error);
  }
};

// delete a product
exports.deleteProduct = async (req, res, next) => {
  const { id } = req.params; // Assuming the product ID is passed as a URL parameter

  try {
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product deleted successfully",
      product: deletedProduct,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    next(error);
  }
};
