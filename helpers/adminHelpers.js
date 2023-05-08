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
      response.revenue = revenue==null ? 0 : revenue;
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

  findAllcategories: () => {
    return new Promise(async (resolve, reject) => {
      await db.category
        .find()
        .exec()
        .then((response) => {
          resolve(response);
        });
    });
  },

  postAddProduct: (userData, filename) => {
    return new Promise((resolve, reject) => {
      uploadedImage = new db.products({
        Productname: userData.name,
        ProductDescription: userData.description,
        Quantity: userData.quantity,
        Image: filename,
        category: userData.category,
        Price: userData.Price,
        OfferPrice: userData.OfferPrice,
      });
      uploadedImage.save().then((data) => {
        resolve(data);
      });
    });
  },

  getViewProducts: (page, perPage) => {
    return new Promise(async (resolve, reject) => {
      await db.products
        .find()
        .skip((page - 1) * perPage)
        .limit(perPage)
        .then((response) => {
          resolve(response);
        });
    });
  },

  get_ViewProductDetails: (id) => {
    return new Promise(async (resolve, reject) => {
      await db.products
        .find({ _id: id })
        .exec()
        .then((response) => {
          console.log(response);
          console.log(response[0]);
          resolve(response[0]);
        });
    });
  },

  addCategory: (data) => {
    console.log(data);
    return new Promise(async (resolve, reject) => {
      const catData = new db.category({ CategoryName: data.category });
      console.log(catData);
      await catData.save().then((data) => {
        // console.log(data)
        resolve(data);
      });
    });
  },
  categoryCheck: async (data) => {
    let check = await db.category.findOne({ CategoryName: data });
    if (check) {
      return true;
    } else {
      return false;
    }
  },

  editcategory: (productId) => {
    return new Promise(async (resolve, reject) => {
      await db.category
        .findOne({ _id: productId })
        .exec()
        .then((response) => {
          resolve(response);
        });
    });
  },
  postEditCategory: (productId, editedcat) => {
    return new Promise(async (resolve, reject) => {
      await db.category
        .updateOne(
          { _id: productId },
          {
            $set: {
              CategoryName: editedcat,
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },

  viewAddCategory: () => {
    return new Promise(async (resolve, reject) => {
      await db.category
        .find()
        .exec()
        .then((response) => {
          resolve(response);
        });
    });
  },

  catNames: async (id) => {
    let catname = await db.category.findOne({ _id: id });
    return catname.CategoryName;
  },
  findProductsWithCategory: async (catname) => {
    let products = await db.products.find({ category: catname });
    return products.length;
  },

  delCategory: (delete_id) => {
    console.log(delete_id);
    return new Promise(async (resolve, reject) => {
      await db.category.deleteOne({ _id: delete_id }).then((response) => {
        resolve(response);
      });
    });
  },

  editProduct: (productId) => {
    return new Promise(async (resolve, reject) => {
      await db.products
        .findOne({ _id: productId })
        .exec()
        .then((response) => {
          resolve(response);
        });
    });
  },

  postEditProduct: (productId, editedData, imageArray) => {
    console.log();
    return new Promise(async (resolve, reject) => {
      await db.products
        .updateOne(
          { _id: productId },
          {
            $set: {
              Productname: editedData.name,
              ProductDescription: editedData.description,
              Quantity: editedData.quantity,
              Price: editedData.price,
              OfferPrice: editedData.OfferPrice,
              category: editedData.category,
              Image: imageArray,
            },
          }
        )
        .then((response) => {
          console.log(response);

          resolve(response);
        });
    });
  },
  deleteProduct: (productId) => {
    return new Promise(async (resolve, reject) => {
      await db.products.deleteOne({ _id: productId }).then((response) => {
        resolve(response);
      });
    });
  },

  get_Allbanners: async (page,perPage) => {
    let bannersFound = await bannerSchema.banner.find().skip((page - 1) * perPage)
    .limit(perPage);
    return bannersFound;
  },

  postAddBanner: (texts, Image) => {
    return new Promise(async (resolve, reject) => {
      console.log("inside promise");
      console.log("imagename", Image);
      uploadedBanner = new bannerSchema.banner({
        title: texts.title,
        description: texts.description,
        link: texts.link,
        image: Image,
        state: "Inactive",
      });
      await uploadedBanner.save().then((response) => {
        resolve(response);
      });
    });
  },
  postEditBanner: (bannerId, editedData, imageArray) => {
    return new Promise(async (resolve, reject) => {
      await bannerSchema.banner
        .updateOne(
          { _id: bannerId },
          {
            $set: {
              title: editedData.title,
              image: imageArray,
              description: editedData.description,
              link: editedData.link,
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },

  bannerPush: async () => {
    try {
      let banners = await bannerSchema.banner.find();
      return banners;
    } catch (error) {
      console.log("didnt get the banners");
    }
  },

  delete_banner: async (bannerId) => {
    let deleted = await bannerSchema.banner.deleteOne({
      _id: objectId(bannerId),
    });
    return deleted;
  },

  //order helpers
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

  getAllCoupons: async () => {
    try {
      let getCoupons = await couponSchema.coupon.find();
      return getCoupons;
    } catch (error) {
      console.log("cannot find coupons from database");
    }
  },
  post_coupons: async (data) => {
    try {
      // Generate a 10-character alphanumeric coupon code starting with "SPRING"
      const code = voucher.generate({
        length: 10,
        count: 1,
        charset: voucher.charset("alphanumeric"),
        pattern: `${data.keywords}-#####`,
      });

      console.log(code); // Outputs something like: "SPRING-F6G7H"

      let couponObj = new couponSchema.coupon({
        couponName: data.couponName,
        code: code[0],
        expiry: data.expiry,
        minPurchase: data.minimumPurchase,
        discountPercentage: data.discountPercentage,
        maxDiscountValue: data.maxDiscountValue,
        description: data.description,
      });

      await couponObj.save();
    } catch (error) {
      console.log("cannot  add coupon");
    }
  },

  edit_coupons: async (data) => {
    try {
      let editedCoupon = await couponSchema.coupon.updateOne(
        { _id: data.id },
        {
          $set: {
            couponName: data.couponName,

            expiry: data.expiry,
            minPurchase: data.minimumPurchase,
            discountPercentage: data.discountPercentage,
            maxDiscountValue: data.maxDiscountValue,
            description: data.description,
          },
        }
      );
      return editedCoupon;
    } catch (error) {
      console.log("cannot  edit coupon");
    }
  },
  removeCoupon: async (id) => {
    try {
      let deleted = await couponSchema.coupon.deleteOne({ _id: objectId(id) });
      return deleted;
    } catch (error) {
      console.log("cannot delete coupon");
    }
  },

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
