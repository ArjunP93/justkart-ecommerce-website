
const adminhelpers = require("../helpers/adminHelpers");
const userhelpers = require("../helpers/userHelpers");
const { category, user } = require("../model/connection");
const objectId = require("mongodb").ObjectId;
const orderSchema = require("../model/orders");
const userorderHelpers = require('../helpers/userorderHelpers')

var loginheader, loginStatus;





module.exports={

    get_orderDetails: (req, res) => {
        let orderId = req.session.latestOrder;
        let userId = req.session.user._id;
    
        userorderHelpers.userOrderDetails(orderId).then(async (currentOrder) => {
          let count = await userhelpers.cart_wishlist_count(userId);
    
          res.render("user/orderdetail", {
            currentOrder,
            cartCount: count.cartCount,
            wishCount: count.wishCount,
            loginheader: true,
          });
        });
      },
      post_cancel_order: async (req, res) => {
        console.log("inside function");
        const userId = req.session.user._id;
        let orderId = req.session.latestOrder;
        let payment = await orderSchema.order.findOne({ _id: orderId });
        if (
          payment.paymentMethod == "online" ||
          payment.paymentMethod == "wallet" ||
          payment.paymentMethod == "wallet+online"
        ) {
          let refund = parseInt(payment.totalPrice);
          await userhelpers.refundToWallet(userId, refund, orderId);
        }
        userorderHelpers.cancelOrder(orderId).then(() => {
          res.json(true);
        });
      },
      post_return_order: (req, res) => {
        let orderId = req.body.orderId;
        let refund = parseInt(req.body.totalAmount);
        const userId = req.session.user._id;
        // console.log('fghjkkkkkkkkkkkkkkkk',orderId,refund,userId);
        userhelpers.refundToWallet(userId, refund, orderId).then(() => {
          res.json(true);
        });
      },
    
      get_userOrdersExpand: (req, res) => {
        let orderId = req.params.id;
        let userId = req.session.user._id;
        userorderHelpers.expandUserOrders(orderId).then(async (orderView) => {
          let countHead = await userhelpers.cart_wishlist_count(userId);
          res.render("user/viewOrderDetail", {
            orderView,
            loginheader: true,
            cartCount: countHead.cartCount,
            wishCount: countHead.wishCount,
          });
        });
      },
}