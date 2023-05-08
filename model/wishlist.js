const mongoose = require("mongoose");
const objectId = require("mongodb").ObjectId;

const wishlistSchema = new mongoose.Schema({
  userId: objectId,
  product: [{ _id: { type: objectId, ref: "products" } }],
  count: Number,
});

module.exports = {
  wishlist: mongoose.model("wishlist", wishlistSchema),
};
