const db = require("../model/connection");
const bannerSchema = require("../model/banner");
const orderSchema = require("../model/orders");
const objectId = require("mongodb").ObjectId;
const couponSchema = require("../model/coupon");
const voucher = require("voucher-code-generator");

module.exports = {
  admin_dashboard: async () => {
    try {
      let response = {};
      let ordercount = await orderSchema.order.countDocuments({});
      let productsCount = await db.products.countDocuments({});
      let catagoryCount = await db.category.countDocuments({});

      let revenue = await orderSchema.order.aggregate([
        {
          $match: {
            orderStatus: "Delivered",
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: "$totalPrice",
            },
          },
        },
      ]);
      let monthlyEarnings = await orderSchema.order.aggregate([
        {
          $match: {
            orderStatus: "Delivered",
          },
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            totalRevenue: { $sum: "$totalPrice" },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]);

      // console.log('monthlyEarnings',monthlyEarnings);

      let paymentcounts = await orderSchema.order.aggregate([
        {
          $match: {
            paymentMethod: { $in: ["COD", "online", "wallet"] },
          },
        },
        {
          $group: {
            _id: "$paymentMethod",
            count: { $sum: 1 },
          },
        },
      ]);

      let monthlySales = await orderSchema.order.aggregate([
        {
          $group: {
            _id: { $month: "$createdAt" },
            orders: { $push: "$$ROOT" },
          },
        },
      ]);

      // converting data for graph from aggregate function
      let dataForGraph_Sales = [];
      for (let i = 1; i <= 12; i++) {
        const month = getMonthName(i);
        const orders =
          monthlySales.find((sale) => sale._id === i)?.orders || [];
        const value = orders.length;
        dataForGraph_Sales.push({ month, value });
      }

      function getMonthName(monthNumber) {
        const date = new Date();
        date.setMonth(monthNumber - 1);
        return date.toLocaleString("default", { month: "long" });
      }

      response.ordercount = ordercount==null ? 0 : ordercount;
      response.productsCount = productsCount==null ? 0 : productsCount;
      response.catagoryCount = catagoryCount==null ? 0 : catagoryCount;
      response.revenue = !revenue[0]?.totalRevenue ? 0 : revenue[0].totalRevenue;
      response.dataForGraph_Sales = dataForGraph_Sales==null ? 0 : dataForGraph_Sales;
      response.paymentcounts = paymentcounts==null ? 0 : paymentcounts;
      response.monthlyEarnings = monthlyEarnings?.pop();

      return response;
    } catch (error) {
      console.log("cannot fetch details for dashboard");
    }
  },

  listUsers: (page, perPage) => {
    let userData = [];
    return new Promise(async (resolve, reject) => {
      await db.user
        .find()
        .skip((page - 1) * perPage)
        .limit(perPage)
        .then((result) => {
          userData = result;
        });
      console.log(userData);
      resolve(userData);
    });
  },

  //block and unblock users
  blockUser: (userId) => {
    return new Promise(async (resolve, reject) => {
      await db.user
        .updateOne({ _id: userId }, { $set: { blocked: true } })
        .then((data) => {
          console.log("user blocked success");
          resolve();
        });
    });
  },
  blockedUserMiddlewareHelper: (userId) => {
    return new Promise(async (resolve, reject) => {
      await db.user.findOne({ _id: userId }).then((data) => {
        resolve(data);
      });
    });
  },

  UnblockUser: (userId) => {
    return new Promise(async (resolve, reject) => {
      await db.user
        .updateOne({ _id: userId }, { $set: { blocked: false } })
        .then((data) => {
          console.log("user unblocked success");
          resolve();
        });
    });
  },

  //for finding all catagories available and making them to passable object


  //order helpers
  



  salesReport: async (start, end) => {
    try {
      const startDate = new Date(`${start}T00:00:00.000Z`);
      const endDate = new Date(`${end}T23:59:59.999Z`);

      let salesData = await orderSchema.order.find({
        orderStatus: "Delivered",
        createdAt: { $gte: startDate, $lte: endDate },
      });
      return salesData;
    } catch (error) {
      console.log("cannot find sales data");
    }
  },
  salesTotal: async (start, end) => {
    const startDate = new Date(`${start}T00:00:00.000Z`);
    const endDate = new Date(`${end}T23:59:59.999Z`);
    try {
      const totalSales = await orderSchema.order.aggregate([
        {
          $match: {
            orderStatus: "Delivered",
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalPrice" },
          },
        },
      ]);
      console.log("total", totalSales);
      return totalSales[0].total;
    } catch (error) {
      console.log("cannot find total");
    }
  },
};
