const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Bid = require("../models/Bid");
const auth = require("../middleware/auth");

const router = express.Router();

// Authenticated: place a bid higher than the current price
router.post("/:productId", auth, async (req, res, next) => {
  try {
    const { productId } = req.params;
    const amount = Number(req.body.amount);
    if (!mongoose.isValidObjectId(productId))
      return res.status(400).json({ message: "Invalid product id" });
    if (req.body.amount === undefined || !Number.isFinite(amount) || amount <= 0)
      return res.status(400).json({ message: "Bid amount must be a positive number" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (String(product.seller) === String(req.user.id))
      return res.status(403).json({ message: "You cannot bid on your own product" });
    if (product.endsAt <= new Date())
      return res.status(400).json({ message: "This auction has ended" });
    if (amount <= product.currentPrice)
      return res.status(400).json({ message: `Bid must be greater than ${product.currentPrice}` });

    // Atomic price check prevents two concurrent bids from both winning at the same price.
    const updated = await Product.findOneAndUpdate(
      { _id: productId, currentPrice: { $lt: amount }, endsAt: { $gt: new Date() }, seller: { $ne: req.user.id } },
      { $set: { currentPrice: amount, highestBidder: req.user.id } },
      { new: true }
    );
    if (!updated)
      return res.status(409).json({ message: "Another bid was placed. Refresh and try again with a higher bid." });

    const bid = await Bid.create({ product: productId, bidder: req.user.id, amount });
    res.status(201).json({ message: "Bid placed successfully", bid, product: updated });
  } catch (err) { next(err); }
});

// Public: bid history for a product
router.get("/:productId", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.productId))
      return res.status(400).json({ message: "Invalid product id" });
    const bids = await Bid.find({ product: req.params.productId })
      .populate("bidder", "name")
      .sort({ amount: -1, createdAt: -1 });
    res.json(bids);
  } catch (err) { next(err); }
});

module.exports = router;