const bcrypt = require("bcrypt");
const { user, products } = require("../model/connection");
const db = require("../model/connection");
const cartSchema = require("../model/cart");
const orderSchema = require("../model/orders");

const couponSchema = require("../model/coupon");
const wishlistSchema = require("../model/wishlist");
const walletSchema = require("../model/wallet");
const objectId = require("mongodb").ObjectId;
const crypto = require("crypto");
const voucher = require("voucher-code-generator");


module.exports={


   
      userOrderDetails: async (orderId) => {
        try {
          let userOrder = await orderSchema.order.findOne({
            _id: objectId(orderId),
          });
          return userOrder;
        } catch (error) {
          console.log("order not found");
        }
      },
      fetchUserOrders: async (uId, page, perPage) => {
        try {
          let allUserOrders = await orderSchema.order
            .find({ userid: uId })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .sort({ createdAt: -1 });
          return allUserOrders;
        } catch (error) {
          console.log("user orders not found");
        }
      },
    
      expandUserOrders: async (oId) => {
        try {
          let vieworder = await orderSchema.order.findOne({ _id: objectId(oId) });
          return vieworder;
        } catch (error) {
          console.log("could not find the order");
        }
      },

    cancelOrder: async (oId) => {
        try {
          let updateOdrder = await orderSchema.order.updateOne(
            { _id: objectId(oId) },
            { $set: { orderStatus: "cancelled by user" } }
          );
          return updateOdrder;
        } catch (error) {
          console.log("cannot update the order status");
        }
      },
}