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

const Razorpay = require("razorpay");

var instance = new Razorpay({
  key_id: "rzp_test_o5Ng9C5xyQwZh3",
  key_secret: "lSPYIhoo2ge5j0t35wqsa9sr",
});

module.exports = {
  doSignUp: (userData) => {
    //console.log(db);
    let response = {};
    return new Promise(async (resolve, reject) => {
      try {
        email = userData.email;
        existingUser = await db.user.findOne({ email: email });
        if (existingUser) {
          response = { status: false };
          return resolve(response);
        } else {
          var hashPassword = await bcrypt.hash(userData.password, 10);
          const data = {
            username: userData.username,
            Password: hashPassword,
            email: userData.email,
            phoneNumber: userData.phonenumber,
          };
          console.log(data);
          await db.user.create(data).then((data) => {
            resolve({ data, status: true });
          });
        }
      } catch (err) {
        console.log(err);
      }
    });
  },

  dologin: (userData) => {
    return new Promise(async (resolve, reject) => {
      try {
        let response = {};
        let users = await db.user.findOne({ email: userData.email });
        console.log(users);
        if (users) {
          if (users.blocked == false) {
            await bcrypt
              .compare(userData.password, users.Password)
              .then((status) => {
                if (status) {
                  response.user = users;
                  response.status = true;
                  resolve(response);
                } else {
                  resolve({ blockedStatus: false, status: false });
                }
              });
          } else {
            resolve({ blockedStatus: true, status: false });
          }
        } else {
          resolve({ blockedStatus: false, status: false });
        }
      } catch (err) {
        console.log(err);
      }
    });
  },
  dologin: (userData) => {
    return new Promise(async (resolve, reject) => {
      try {
        let response = {};
        let users = await db.user.findOne({ email: userData.email });
        console.log(users);
        if (users) {
          if (users.blocked == false) {
            await bcrypt
              .compare(userData.password, users.Password)
              .then((status) => {
                if (status) {
                  response.user = users;
                  response.status = true;
                  resolve(response);
                } else {
                  resolve({ blockedStatus: false, status: false });
                }
              });
          } else {
            resolve({ blockedStatus: true, status: false });
          }
        } else {
          resolve({ blockedStatus: false, status: false });
        }
      } catch (err) {
        console.log(err);
      }
    });
  },

  listProductShop: (page, perPage) => {
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

  viewProductDetails: (id) => {
    return new Promise(async (resolve, reject) => {
      await db.products
        .find({ _id: id })
        .exec()
        .then((response) => {
          resolve(response[0]);
        });
    });
  },
  otpLogin: (body) => {
    return new Promise(async (resolve, reject) => {
      console.log(body);

      await db.user.findOne({ phoneNumber: body }).then((response) => {
        console.log(response);
        if (response) {
          resolve(response);
        } else {
          reject();
        }
      });
    });
  },

  findCategoryName: (id) => {
    return new Promise(async (resolve, reject) => {
      await db.category.findOne({ _id: id }).then((response) => {
        console.log(response.CategoryName, "teeeeeeeeeee");
        resolve(response.CategoryName);
      });
    });
  },
  findAllProducts: (catName, page, perPage) => {
    return new Promise(async (resolve, reject) => {
      await db.products
        .find({ category: catName })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .then((data) => {
          // console.log(data,'geiiereiha');
          resolve(data);
        });
    });
  },
  cart_wishlist_count: async (uId) => {
    let countsForHeader = {};
    let cart = await cartSchema.cart.findOne({ userId: objectId(uId) });
    let wishlist = await wishlistSchema.wishlist.findOne({
      userId: objectId(uId),
    });
    countsForHeader.cartCount = cart ? cart.product.length : 0;
    countsForHeader.wishCount = wishlist ? wishlist.product.length : 0;

    return countsForHeader;
  },

  addAdress: (uId, data) => {
    let addressobj = {
      firstName: data.fname,
      lastName: data.lname,
      street: data.street,
      building: data.building,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      mobile: data.mobile,
      email: data.email,
    };

    console.log(addressobj, "addressobj");
    return new Promise(async (resolve, reject) => {
      let addressDetails = await db.address.findOne({ userid: uId });

      if (addressDetails == null) {
        const addressItem = new db.address({
          userid: objectId(uId),
          Address: addressobj,
        });

        await addressItem.save().then(() => {
          let message = "address added";
          resolve(message);
        });
      } else {
        await db.address.updateOne(
          { userId: objectId(uId) },
          { $push: { Address: addressobj } }
        );
        resolve();
      }
    });
  },

  getAddress: async (uId) => {
    try {
      let user_address = await db.address.findOne({ userid: uId });
      return user_address;
    } catch (error) {
      console.log("didnt get the user address");
    }
  },
  getSelectedAddress: async (addressId, uId) => {
    try {
      console.log("addre", addressId);
      console.log("usererer", uId);
      let address = await db.address.findOne({
        userid: objectId(uId),
        "Address._id": objectId(addressId),
      });
      console.log("saakdjdskfkdsf", address);
      return address;
    } catch (error) {
      console.log("didnt get the user address");
    }
  },

  userDetails: async (uId) => {
    try {
      let getuser = await db.user.findOne({ userid: uId });
      return getuser;
    } catch (error) {
      console.log("didnt get the userdetails");
    }
  },

  refundToWallet: (uId, refund, oId) => {
    try {
      let transactionsObj = {
        _id: objectId(oId),
        type: "credit",
        amount: refund,
        createdAt: new Date(),
      };
      return new Promise(async (resolve, reject) => {
        let walletDetails = await walletSchema.wallet.findOne({ userId: uId });

        if (walletDetails == null) {
          const walletItem = new walletSchema.wallet({
            userId: objectId(uId),
            balance: refund,
            transactions: transactionsObj,
          });
          await walletItem.save();
        } else {
          let currentBalance = walletDetails.balance;
          let newBalance = currentBalance + refund;
          await walletSchema.wallet.updateOne(
            { userId: objectId(uId) },
            {
              $set: { balance: newBalance },
              $push: { transactions: transactionsObj },
            }
          );
        }
        //update product fund status
        await orderSchema.order.updateOne(
          { _id: oId },
          {
            $set: { orderStatus: "returned", paymentStatus: "refunded" },
          }
        );

        resolve();
      });
    } catch (error) {
      console.log("cannot refund or update");
    }
  },
  purchaseWithWallet: async (uId, oId, amount = 0, walletFund = 0) => {
    try {
      let transObj = {
        _id: objectId(oId),
        type: "debit",
        amount: amount,

        createdAt: new Date(),
      };
      let walletBalance = parseInt(walletFund - amount);
      let result = await walletSchema.wallet.updateOne(
        { userId: objectId(uId) },
        {
          $set: { balance: walletBalance },
          $push: { transactions: transObj },
        }
      );
      return result;
    } catch (error) {
      console.log("could not purchase with walllet balance");
    }
  },
  checkWalletBalance: async (uId) => {
    try {
      let balance = await walletSchema.wallet.findOne({
        userId: objectId(uId),
      });
      return balance;
    } catch (error) {
      console.log("cannot find balance");
    }
  },

  createOrder: async (
    userid,
    userInfo,
    cart,
    payment,
    couponCode,
    payStatus,
    total_checkout,
    shippingAddressObj
  ) => {
    try {
      const orderObj = new orderSchema.order({
        userid: objectId(userid),
        _id: new objectId(),
        name: userInfo.username,
        productDetails: cart,
        paymentMethod: payment,
        paymentStatus: payStatus,
        totalPrice: total_checkout,
        shippingAddress: shippingAddressObj,
        orderStatus: "confirmed",
        coupons: couponCode,
      });

      //hashing id
      let id = orderObj._id;
      const hash = crypto.createHash("sha256");
      hash.update(id.toString());
      let userHashId = hash.digest("hex").slice(0, 6);

      orderObj.hashedId = userHashId;

      await orderObj.save();

      return Promise.resolve(orderObj._id);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  getRazorpay: (orderId, total) => {
    try {
      return new Promise((resolve) => {
        const razorpay = new Razorpay({
          // eslint-disable-next-line no-undef
          key_id: process.env.RAZORPAY_KEY_ID,
          // eslint-disable-next-line no-undef
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        const options = {
          amount: total * 100,
          currency: "INR",
          receipt: "" + orderId,
          payment_capture: 1,
        };
        razorpay.orders.create(options, function (err, order) {
          if (err) {
            console.log(err);
          } else {
            resolve(order);
          }
        });
      });
    } catch (error) {
      console.log(error);
      throw new Error("Failed to get razorpay");
    }
  },

  verifyPayment: (paymentInfo) => {
    try {
      return new Promise((resolve, reject) => {
        let hmac = crypto.createHmac("sha256", "lSPYIhoo2ge5j0t35wqsa9sr");
        hmac.update(
          paymentInfo["order[razorpay_order_id]"] +
            "|" +
            paymentInfo["order[razorpay_payment_id]"]
        );

        hmac = hmac.digest("hex");
        console.log("-----------------", hmac);

        console.log("payment", paymentInfo["order[razorpay_signature]"]);

        if (hmac === paymentInfo["order[razorpay_signature]"]) {
          resolve({ status: true, orderId: paymentInfo["payment[receipt]"] });
        } else {
          reject({ status: false, orderId: paymentInfo["payment[receipt]"] });
        }
      });
    } catch (error) {
      console.log(error);
      throw new Error("Failed to verify razorpay payment");
    }
  },

  updateOrderPayment: async (orderId) => {
    try {
      console.log("inside payment");
      let update = await orderSchema.order.updateOne(
        { _id: objectId(orderId) },
        { $set: { paymentStatus: "success" } }
      );
      return update;
    } catch (error) {
      console.log("cannot update order status");
    }
  },

  // add coupon to user schema
  couponAddtoUser: async (Code, userid) => {
    if (Code !== "N/A") {
      await db.user.updateOne({ _id: userid }, { $push: { coupons: Code } });
    }
  },

  verifyCouponCode: async (id, total, couponCode) => {
    try {
      return new Promise(async (resolve, reject) => {
        let updatedCartTotal, couponValid, couponStatus;
        let couponExist = await couponSchema.coupon.findOne({
          code: couponCode,
        });
        if (couponExist) {
          if (new Date(couponExist.expiry) - new Date() > 0) {
            if (total >= couponExist.minPurchase) {
              let couponDiscount =
                total * (couponExist.discountPercentage / 100);
              let discountedTotal = total - couponDiscount;
              if (discountedTotal > couponExist.maxDiscountValue) {
                couponDiscount = couponExist.maxDiscountValue;
                updatedCartTotal = total - couponExist.maxDiscountValue;
              } else {
                updatedCartTotal = discountedTotal;
              }
              let couponUsed = await db.user.findOne({
                _id: id,
                coupons: couponCode,
              });
              console.log("couponused", couponUsed);
              if (couponUsed) {
                couponValid = false;
                resolve({ couponValid, updatedCartTotal });
              } else {
                couponValid = true;
                resolve({
                  couponValid,
                  couponCode,
                  updatedCartTotal,
                  couponDiscount,
                });
              }
            } else {
              resolve({
                couponStatus:
                  "coupon cannot be applied due to mincart value not reached ",
                updatedCartTotal,
              });
            }
          } else {
            resolve({ couponStatus: "coupon expired ", updatedCartTotal });
          }
        } else {
          resolve({ couponStatus: "invalid coupon code ", updatedCartTotal });
        }
      });
    } catch (error) {
      console.log("cannot validate coupon");
    }
  },

  //wishlist

  addTowishlistHelp: (uId, proId) => {
    let proObj = {
      _id: objectId(proId),
    };
    return new Promise(async (resolve, reject) => {
      let userwishlistDetails = await wishlistSchema.wishlist.findOne({
        userId: uId,
      });

      if (userwishlistDetails == null) {
        const wishlistItem = new wishlistSchema.wishlist({
          userId: objectId(uId),
          product: proObj,
        });
        await wishlistItem.save().then(() => {
          resolve({ wishlistAdded: true });
        });
      } else {
        console.log("test");

        let userwishlist = await wishlistSchema.wishlist.findOne({
          userId: objectId(uId),
          "product._id": proObj._id,
        });

        if (!userwishlist) {
          await wishlistSchema.wishlist.updateOne(
            { userId: objectId(uId) },
            { $push: { product: proObj } }
          );
          resolve({ wishlistAdded: true });
        } else {
          resolve({ wishlistExist: true });
        }
      }
    });
  },

  viewWishlist: async (uId) => {
    let data = await wishlistSchema.wishlist.aggregate([
      {
        $match: {
          userId: objectId(uId),
        },
      },
      {
        $unwind: {
          path: "$product",
          includeArrayIndex: "string",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "product._id",
          foreignField: "_id",
          as: "proDetails",
        },
      },
      {
        $unwind: {
          path: "$proDetails",
          includeArrayIndex: "string",
        },
      },
      {
        $project: {
          _id: 0,
          proId: "$proDetails._id",
          Productname: "$proDetails.Productname",
          ProductDescription: "$proDetails.ProductDescription",
          Quantity: "$proDetails.Quantity",
          Image: "$proDetails.Image",
          Price: "$proDetails.Price",
          category: "$proDetails.category",
        },
      },
    ]);
    // console.log('aggregate data',data);
    return data;
  },

  deleteFromWishlist: async (proId, uId) => {
    return new Promise(async (resolve, reject) => {
      await wishlistSchema.wishlist
        .updateOne(
          { userId: objectId(uId) },
          { $pull: { product: { _id: objectId(proId) } } }
        )
        .then((result) => {
          resolve(result);
        });
    });
  },
};
