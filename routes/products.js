const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const auth = require("../middleware/auth");

const router = express.Router();

// Public: list auction products
router.get("/", async (req, res, next) => {
  try {
    const products = await Product.find()
      .populate("seller", "name")
      .populate("highestBidder", "name")
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (err) { next(err); }
});

// Public: one product and its highest bidder
router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: "Invalid product id" });
    const product = await Product.findById(req.params.id)
      .populate("seller", "name")
      .populate("highestBidder", "name");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) { next(err); }
});

// Authenticated: add an auction product
router.post("/", auth, async (req, res, next) => {
  try {
    const { title, description, imageUrl = "", startingPrice, endsAt } = req.body;
    if (!title || !description || startingPrice === undefined || !endsAt)
      return res.status(400).json({ message: "Title, description, starting price and end time are required" });

    const price = Number(startingPrice);
    const endDate = new Date(endsAt);
    if (!Number.isFinite(price) || price < 0)
      return res.status(400).json({ message: "Starting price must be a non-negative number" });
    if (Number.isNaN(endDate.getTime()) || endDate <= new Date())
      return res.status(400).json({ message: "End time must be a future date" });
    if (imageUrl && !/^https?:\/\//i.test(imageUrl))
      return res.status(400).json({ message: "Image URL must start with http:// or https://" });

    const product = await Product.create({
      title, description, imageUrl, startingPrice: price, currentPrice: price,
      endsAt: endDate, seller: req.user.id
    });
    res.status(201).json({ message: "Auction product created", product });
  } catch (err) { next(err); }
});

module.exports = router;