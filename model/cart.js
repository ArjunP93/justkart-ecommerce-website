var mongoose = require("mongoose");
const objectId = require("mongodb").ObjectId;
const db = mongoose
  .connect("mongodb://0.0.0.0:27017/ecommerce", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connected!"))
  .catch((err) => console.log(err));

const cartSchema = new mongoose.Schema({
  userId: objectId,
  product: [
    {
      _id: { type: objectId, ref: "products" },

      quantity: { type: Number },
      subtotal: { type: Number },
    },
  ],
  totalAmount: Number,
  count: Number,
});

module.exports = {
  cart: mongoose.model("cart", cartSchema),
};
