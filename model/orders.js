var mongoose = require("mongoose");
const objectId = require("mongodb").ObjectId;
const db = mongoose
  .connect("mongodb://0.0.0.0:27017/ecommerce", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connected!"))
  .catch((err) => console.log(err));

const orderSchema = new mongoose.Schema({
  userid: {
    type: objectId,
    ref: "user",
  },
  name: String,
  productDetails: Array,
  paymentMethod: String,
  paymentStatus: String,
  totalPrice: Number,

  shippingAddress: Object,
  orderStatus: String,
  status: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },

  hashedId: String,
  coupons: String,
});
module.exports = {
  order: mongoose.model("order", orderSchema),
};
