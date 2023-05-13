// const { delete_banner } = require("../helpers/adminhelpers");
const adminhelpers = require("../helpers/adminHelpers");
const userhelpers = require("../helpers/userHelpers");
const { category, user } = require("../model/connection");
const objectId = require("mongodb").ObjectId;
const orderSchema = require("../model/orders");
const db = require("../model/connection");
const bannerSchema = require("../model/banner");
const cartHelpers = require("../helpers/cartHelpers");

var loginheader, loginStatus;






module.exports={


    ajaxAddToCart: (req, res) => {
        let productId = req.query.proId;
        let userId = req.session.user._id;
        let temp = req.query.quantity;
        let qty = parseInt(temp);
        let subt = parseInt(req.query.subTotal);
    
        console.log("hello:", productId, userId, qty);
        cartHelpers
          .addToCart_post(productId, userId, qty, subt)
          .then((response) => {
            res.json(true);
          });
      },
    
      ajaxViewCart: async (req, res) => {
        let userId = req.session.user._id;
        let user = req.session.user;
    
        let totals = await cartHelpers.cartTotal(userId);
        console.log(totals);
        let total;
        if (totals.length != 0) {
          total = totals[0].total;
        } else {
          total = 0;
        }
        console.log("inside viewcart");
        cartHelpers.viewUser_cart(userId).then(async (response) => {
          console.log("view:", response);
          let count = response.count;
    
          let countHeader = await userhelpers.cart_wishlist_count(userId);
    
          res.render("user/cart", {
            response,
            count,
            userId,
            cartCount: countHeader.cartCount,
            wishCount: countHeader.wishCount,
            loginheader: true,
            total,
          });
        });
      },
    
      ajaxUpdatecart: async (req, res) => {
        let productId = req.body.proId;
        let userId = req.session.user._id;
        let qty = parseInt(req.body.quantity);
        let subTotal = parseInt(req.body.subtotal);
        let count = parseInt(req.body.count);
    
        console.log(count, qty);
        const updatedQty = qty + count;
        if (updatedQty == 0) {
          await cartHelpers.deleteProInCart(productId, userId);
          res.json(true);
        } else {
          await cartHelpers.updateCart(productId, userId, updatedQty, subTotal);
          res.json(true);
        }
      },
      ajaxCartTotal: async (req, res) => {
        let total = await cartHelpers.cartTotal(req.query.userId);
    
        res.json(total);
      },
    
      deleteInCart: async (req, res) => {
        let userId = req.session.user._id;
        console.log("kpdelete", req.body.proId);
        await cartHelpers.deleteProInCart(req.body.proId, userId);
        res.json(true);
      }




}