const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  imageUrl: { type: String, default: "" },
  startingPrice: { type: Number, required: true, min: 0 },
  currentPrice: { type: Number, required: true, min: 0 },
  endsAt: { type: Date, required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  highestBidder: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
}, { timestamps: true });

productSchema.index({ endsAt: 1 });
module.exports = mongoose.model("Product", productSchema);