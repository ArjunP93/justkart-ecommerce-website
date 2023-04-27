var mongoose = require("mongoose");
const objectId = require('mongodb').ObjectId;
const db =mongoose .connect("mongodb://0.0.0.0:27017/ecommerce", {
        useNewUrlParser: true,
        useUnifiedTopology: true })   
 .then(() => console.log("Database connected!"))
 .catch(err => console.log(err));


 const userschema= new mongoose.Schema({
    username:{
        type:String,
        required: true,
        unique:true
    },
    Password:{
        type:String,
        required:true,
    
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    
    access:{
        type:Boolean,default:false

    },
    CreatedAt:{
        type:Date,
        default:Date.now,
    }, 
    phoneNumber:{
        type:String,
        required:true,
        unique:true,
        index:true
    },
    blocked:{
      type:Boolean,default:false
  },
  address: Array,

  coupons:Array
   



 })
 const productSchema=new mongoose.Schema({
    Productname:{
      type:String
    },
    ProductDescription:{
      type:String
    },
    Quantity:{
      type:Number
    },
    Image:{
      type:Array,
     
    },
    Price:{
    type:Number
    },
    OfferPrice:{
      type:Number
    },
    category:{
      type:String
    },
   
  
    })
  


 const categorySchema= new mongoose.Schema({
    CategoryName:{
        type:String
    }
 })

 const address_Schema = new mongoose.Schema({
  userid: {
    type: objectId,
    ref: 'user'
  },
  Address: [
    {
      firstName: { type: String },
      lastName: { type: String },
      street: { type: String },
      building: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: Number },
      mobile: { type: Number },
      email: { type: String }
    }
  ]

 })

 


 module.exports={
    user : mongoose.model('user',userschema),
    category : mongoose.model('category',categorySchema),
    products : mongoose.model('products',productSchema),
    address : mongoose.model('address',address_Schema)
    
 }