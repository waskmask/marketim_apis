const Category = require("../models/category"); // Adjust the path to your Category model
const redis = require("redis");

let redisClient = null;

(async () => {
  try {
    // Create the Redis client
    redisClient = redis.createClient({
      url: "redis://localhost:6379", // This is a common way to specify Redis connection details
    });

    // Connect to Redis
    await redisClient.connect();

    console.log("Connected to Redis");

    // Properly handle connection errors
    redisClient.on("error", (error) => {
      // console.error("Redis Client Error", error);
      redisClient = null;
    });

    // Optionally handle the connection end event
    redisClient.on("end", () => {
      console.log("Redis connection closed");
      redisClient = null;
    });
  } catch (error) {
    // console.error("Failed to connect to Redis:", error);
    redisClient = null;
  }
})();

exports.createCategory = async (req, res) => {
  try {
    const { categoryName } = req.body;

    // Check if the category name already exists (case-insensitive search)
    const existingCategory = await Category.findOne({
      categoryName: {
        $regex: new RegExp("^" + categoryName.toLowerCase() + "$", "i"),
      },
    });

    if (existingCategory) {
      return res.status(400).json({ message: "Category name already exists" });
    }

    // Convert categoryName to lowercase before saving
    const category = new Category({
      categoryName: categoryName.toLowerCase(),
      status: "active",
    });

    const savedCategory = await category.save();
    // Fixed JSON response to correctly include the message
    res.status(201).json({
      category: savedCategory,
      message: "Category saved successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Category name already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

// get categories
exports.getCategories = async (req, res) => {
  try {
    let categories;
    const cachedDataKey = "allCategories";

    if (redisClient) {
      // Ensure redisClient is available
      try {
        const cachedData = await redisClient.get(cachedDataKey);
        if (cachedData) {
          console.log("Data found in cache");
          categories = JSON.parse(cachedData);
          return res.status(200).json(categories);
        }
      } catch (redisError) {
        console.error(
          "Redis error, falling back to primary database:",
          redisError
        );
      }
    }

    // Fetch data from your database as a fallback
    categories = await Category.find({});

    if (redisClient) {
      try {
        await redisClient.set(cachedDataKey, JSON.stringify(categories));
        console.log("Data cached in Redis");
      } catch (redisError) {
        console.error("Failed to cache data in Redis:", redisError);
      }
    }

    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// update category status
exports.updateCategoryStatus = async (req, res) => {
  try {
    const { id, status } = req.body; // Get id and status from the request body

    // Validate the provided inputs
    if (!id || !status || !["active", "inactive"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid or missing id or status field" });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { status: status },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({
      message: `Category marked as ${status}`,
      category: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// update category
exports.updateCategory = async (req, res) => {
  try {
    const { id, status, categoryName } = req.body;

    // Basic validation to ensure an ID is provided
    if (!id) {
      return res.status(400).json({ message: "Invalid or missing id" });
    }

    // Initialize an object to accumulate updates
    let updateFields = {};

    // Add status to the update object if it's valid
    if (status && ["active", "inactive"].includes(status)) {
      updateFields.status = status;
    } else if (status) {
      // If status is provided but invalid
      return res.status(400).json({ message: "Invalid status field" });
    }

    // Add categoryName to the update object if it's provided
    if (categoryName) {
      updateFields.categoryName = categoryName.toLowerCase();
    }

    // If no valid fields are provided to update, return an error or message
    if (Object.keys(updateFields).length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields provided for update" });
    }

    const updatedCategory = await Category.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
