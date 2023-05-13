const objectId = require("mongodb").ObjectId;

const orderSchema = require("../model/orders");
const orderHelpers = require("../helpers/orderHelpers");
let adminStatus;

module.exports = {
  get_all_orders: async (req, res) => {
    //pagination
    const page = req.query.page || 1;
    const perPage = 10;
    const count = await orderSchema.order.countDocuments({});
    console.log("count", count);
    const orderListCount = count;

    let allOrders = await orderHelpers.all_orders(page, perPage);

    res.render("admin/admin-orders-page", {
      layout: "adminLayout",
      adminStatus:true,
      allOrders,
      pages: Math.ceil(orderListCount / perPage),
    });
  },

  get_adminOrdersExpand: async (req, res) => {
    let orderId = req.params.id;
    let orderdetail = await orderHelpers.expandAdminOrders(orderId);
    res.render("admin/admin-order-detail", {
      layout: "adminLayout",
      adminStatus:true,
      orderdetail,
    });
  },

  updateProductStatus: async (req, res) => {
    let data = req.body.status;
    let orderId = req.body.order;

    await orderHelpers
      .updateOrderStatus_admin(data, orderId)
      .then((response) => {
        res.redirect("/admin/all-orders");
      });
  },
};
