// var mongoose = require("mongoose");
// const db =mongoose .connect("mongodb://0.0.0.0:27017/ecommerce", {
//       useNewUrlParser: true,
//       useUnifiedTopology: true })
// .then(() => console.log("Database connected!"))
// .catch(err => console.log(err));

const mongoose = require("mongoose");
const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  image: {
    type: Array,
    required: true,
  },
  description: {
    type: String,
  },
  link: {
    type: String,
  },
  created_At: {
    type: Date,
    default: Date.now,
  },
  updated_At: {
    type: Date,
    default: Date.now,
  },
  status: { type: Boolean, default: false },
  state: String,
});

module.exports = {
  banner: mongoose.model("banner", bannerSchema),
};
