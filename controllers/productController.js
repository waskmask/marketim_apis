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

exports.updateProduct = async (req, res, next) => {
  const { id } = req.params;
  const updateFields = req.body;
  const removedImages = req.body.removedImages
    ? JSON.parse(req.body.removedImages)
    : [];

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => path.basename(file.path));
      updateFields.images = [
        ...product.images.filter((img) => !removedImages.includes(img)),
        ...newImages,
      ];

      // Handle thumbnail update if needed
      const thumbnailFile = req.files[0];
      if (thumbnailFile) {
        const timestamp = Date.now();
        const thumbnailFilename = `thumbnail-${timestamp}.png`;
        const thumbnailFullPath = `uploads/${thumbnailFilename}`;
        const image = await jimp.read(thumbnailFile.path);
        await image
          .resize(100, jimp.AUTO)
          .quality(100)
          .writeAsync(thumbnailFullPath);
        updateFields.thumbnail = thumbnailFilename;
      }
    } else {
      updateFields.images = product.images.filter(
        (img) => !removedImages.includes(img)
      );
    }

    // Update the product with the new data
    const updatedProduct = await Product.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

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
