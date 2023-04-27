var mongoose = require("mongoose");
const objectId = require('mongodb').ObjectId;
const db =mongoose .connect("mongodb://0.0.0.0:27017/ecommerce", {
        useNewUrlParser: true,
        useUnifiedTopology: true })   
 .then(() => console.log("Database connected!"))
 .catch(err => console.log(err));


 const couponSchema = new mongoose.Schema({
    couponName: String,
    code:String,
    expiry: {
    type: Date,
    default: new Date(),
    },
    minPurchase: Number,
    discountPercentage: Number,
    maxDiscountValue: Number,
    couponApplied: {
    type: String,
    default: false
    },
    isActive: {
    type: Boolean,
    default: false
    },
    description: String,
    createdAt: {
    type: Date,
    default: new Date(),
    

    }
    
 })

 module.exports={
    coupon:mongoose.model('coupon',couponSchema)
 }