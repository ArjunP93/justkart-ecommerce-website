const orderSchema = require("../model/orders");
const objectId = require("mongodb").ObjectId;

module.exports = {
  all_orders: async (page, perPage) => {
    try {
      let allOrderList = await orderSchema.order
        .find()
        .skip((page - 1) * perPage)
        .limit(perPage)
        .sort({ createdAt: -1 });
      return allOrderList;
    } catch (error) {
      console.log("cannot get all orders");
    }
  },

  expandAdminOrders: async (oId) => {
    try {
      let vieworderAdmin = await orderSchema.order.findOne({
        _id: objectId(oId),
      });
      return vieworderAdmin;
    } catch (error) {
      console.log("could not find the order");
    }
  },

  updateOrderStatus_admin: (data, oId) => {
    try {
      let updatedStatus = orderSchema.order.updateOne(
        { _id: objectId(oId) },
        { $set: { orderStatus: data } }
      );
      return updatedStatus;
    } catch (error) {
      console.log("cannot update status");
    }
  },
};
