
var mongoose = require("mongoose");
const objectId = require('mongodb').ObjectId;
const db =mongoose .connect("mongodb://0.0.0.0:27017/ecommerce", {
        useNewUrlParser: true,
        useUnifiedTopology: true })   
 .then(() => console.log("Database connected!"))
 .catch(err => console.log(err));

const walletSchema = new mongoose.Schema({
    userId: {
        type: objectId,
        ref: 'user',
        required: true
    },
    balance: {
        type: Number,
        required: true
    },
    transactions: {
        type: [Object],
        default: []
    }
  })
  module.exports={
    wallet:mongoose.model('wallet',walletSchema)
 }