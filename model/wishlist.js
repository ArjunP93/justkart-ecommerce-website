var mongoose = require("mongoose");
const objectId = require('mongodb').ObjectId;
const db =mongoose .connect("mongodb://0.0.0.0:27017/ecommerce", {
        useNewUrlParser: true,
        useUnifiedTopology: true })   
 .then(() => console.log("Database connected!"))
 .catch(err => console.log(err));


 const wishlistSchema = new mongoose.Schema({
    userId : objectId,
    product : [{_id : {type:objectId,ref:"products"}}],
    count : Number
 })

 module.exports={
    wishlist:mongoose.model('wishlist',wishlistSchema)
 }