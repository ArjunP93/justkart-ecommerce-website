   var mongoose = require("mongoose");
   const db =mongoose .connect("mongodb://0.0.0.0:27017/ecommerce", {
         useNewUrlParser: true,
         useUnifiedTopology: true })   
   .then(() => console.log("Database connected!"))
   .catch(err => console.log(err));
 

 const bannerSchema= new mongoose.Schema({

   title:{
      type:String,
      required:true
   },
   image:{
      type:String,
      required:true
   },
   description:{
      type:String,
      required:true
   },
   link:{
      type:String,
      required:true
   },
   created_At:{
      type:Date,
      default:Date.now


   },
   updated_At:{
      type:Date,
      default:Date.now
      

   }


 })

 module.exports = {
    banner : mongoose.model('banner',bannerSchema)

 }