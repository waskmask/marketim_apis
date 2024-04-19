const Brand = require("../models/brand"); // Adjust the path to your Brand model

exports.createBrand = async (req, res) => {
  try {
    const brandName = req.body.brandName.toLowerCase();
    const existingBrand = await Brand.findOne({ brandName: brandName });

    if (existingBrand) {
      return res.status(400).json({ message: "Brand name already exists" });
    }

    // Use just the filename if a file was uploaded
    const brandLogo = req.file ? req.file.filename : "";

    const brand = new Brand({
      brandName,
      brandLogo,
      status: "active",
    });

    const savedBrand = await brand.save();
    res.status(201).json({
      brand: savedBrand,
      message: "Brand created successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get categories
exports.getBrands = async (req, res) => {
  try {
    const brands = await Brand.find({});
    res.status(200).json(brands);
  } catch (error) {
    console.error(error); // Log error for debugging
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: "Invalid or missing id" });
    }

    let updateFields = {};
    if (req.body.brandName) {
      updateFields.brandName = req.body.brandName.toLowerCase();
    }
    // Update brandLogo only if a new file is uploaded, using just the filename
    if (req.file) {
      updateFields.brandLogo = req.file.filename;
    }

    const updatedBrand = await Brand.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });
    if (!updatedBrand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    res.json({
      message: "Brand updated successfully",
      brand: updatedBrand,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBrandStatus = async (req, res) => {
  console.log(req.body);
  try {
    const { id, status } = req.body;
    if (!id || !status || !["active", "inactive"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid or missing id or status" });
    }

    const updatedBrand = await Brand.findByIdAndUpdate(
      id,
      { status: status },
      { new: true, runValidators: true }
    );
    if (!updatedBrand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    res.json({
      message: `Brand status updated to ${status}`,
      brand: updatedBrand,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
