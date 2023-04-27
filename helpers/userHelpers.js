const bcrypt = require('bcrypt')
const { user, products } = require('../model/connection')
const db = require('../model/connection')
const cartSchema= require('../model/cart')
const orderSchema= require('../model/orders')
const bannerschema = require('../model/banner')
const couponSchema = require('../model/coupon')
const wishlistSchema = require('../model/wishlist')
const walletSchema = require('../model/wallet')
const objectId = require('mongodb').ObjectId;
const crypto = require('crypto');
const voucher = require('voucher-code-generator');

const Razorpay = require('razorpay');

var instance = new Razorpay({
  key_id: 'rzp_test_o5Ng9C5xyQwZh3',
  key_secret: 'lSPYIhoo2ge5j0t35wqsa9sr',
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
          console.log(response[0]);
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

  addToCart_post: (proId, uId, qty, subTotal) => {
    let productObj = {
      _id:objectId(proId),
      quantity: qty,
      subtotal: subTotal,
    };
    console.log("productObj :", productObj);
    return new Promise(async (resolve, reject) => {
      let userCartDetails = await cartSchema.cart.findOne({ userId: uId });

      if (userCartDetails == null) {
        const cartItem = new cartSchema.cart({
          userId: objectId(uId),
          product: productObj,
        });
        await cartItem.save().then(() => {
          resolve();
        });
      } else {
        console.log("test");

        let userCart = await cartSchema.cart.findOne({
          userId: objectId(uId),
          "product._id": productObj._id,
        });

        if (userCart) {
          await cartSchema.cart.updateOne(
            { userId: objectId(uId), "product._id": productObj._id },
            {
              $set: {
                "product.$.quantity": qty,
                "product.$.subtotal": subTotal,
              },
            }
          );
          resolve();
        } else {
          await cartSchema.cart.updateOne(
            { userId: objectId(uId) },
            { $push: { product: productObj } }
          );
          resolve();
        }
      }
    });
  },

  viewUser_cart: (uId) => {
    let response = {};

    return new Promise(async (resolve, reject) => {
      [productCart] = await cartSchema.cart
        .find({ userId: objectId(uId) })
        .populate("product._id");

      (response.cart = productCart),
        (response.count = productCart.product.length);

      console.log("response of populate", response);

      resolve(response);
    });
  },
  viewCart_aggregate: async (uId) => {
    console.log("userid", uId);
    try {
      const result = await cartSchema.cart.aggregate([
        {
          $match: {
            userId: objectId(uId),
          },
        },
        {
          $unwind: {
            path: "$product",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "product._id",
            foreignField: "_id",
            as: "details",
          },
        },
        {
          $unwind: {
            path: "$details",
            includeArrayIndex: "string",
          },
        },
        {
          $project: {
            _id: 0,
            ProId: "$product._id",
            Productname: "$details.Productname",
            quantity: "$product.quantity",
            Image: "$details.Image",
            Price: "$details.Price",
            category: "$details.category",
            subtotal: "$product.subtotal",
          },
        },
      ]);
      console.log("aggregated", result);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  updateCart: (proId, uId, qty, subTotal) => {
    console.log("inside-helper", proId);
    return new Promise(async (resolve, reject) => {
      await cartSchema.cart
        .updateOne(
          { userId: objectId(uId), "product._id": objectId(proId) },
          {
            $set: { "product.$.quantity": qty, "product.$.subtotal": subTotal },
          }
        )
        .then((data) => {
          resolve();
        });
    });
  },
  cartTotal: (uId) => {
    try {
      return new Promise(async (resolve, reject) => {
        // console.log(uId)
        await cartSchema.cart
          .aggregate([
            {
              $match: {
                userId: objectId(uId),
              },
            },
            {
              $unwind: "$product",
            },
            {
              $project: {
                subtotal: "$product.subtotal",
              },
            },
            {
              $group: {
                _id: null,
                total: {
                  $sum: "$subtotal",
                },
              },
            },
          ])
          .then((response) => {
            // console.log(response);

            resolve(response);
          });
      });
    } catch (error) {}
  },

  deleteProInCart: (proId, uId) => {
    console.log("testinside helperr");
    return new Promise(async (resolve, reject) => {
      await cartSchema.cart
        .updateOne(
          { userId: objectId(uId) },
          { $pull: { product: { _id: objectId(proId) } } }
        )
        .then((result) => {
          resolve(result);
        });
    });
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
      let addressDetails = await db.address.findOne({ userId: uId });

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
      let address = await db.address.findOne(
        { userid: objectId(uId), "Address._id": objectId(addressId) },
        
      );
      console.log('saakdjdskfkdsf',address);
      return address;
      
    } catch (error) {
      console.log("didnt get the user address");
    }
  },

  bannerPush: async () => {
    try {
      let banners = await bannerschema.banner.find();
      return banners;
    } catch (error) {
      console.log("didnt get the banners");
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

  cancelOrder: async (oId) => {
    try {
      console.log("orderid", oId);
      let updateOdrder = await orderSchema.order.updateOne(
        { _id: objectId(oId) },
        { $set: { orderStatus: "cancelled by user" } }
      );
      return updateOdrder;
    } catch (error) {
      console.log("cannot update the order status");
    }
  },
  refundToWallet: (uId,refund,oId) => {
    try {
      let transactionsObj = {
        _id: objectId(oId),
        type: 'credit',
        amount: refund,
        createdAt : new Date(),
      };
      return new Promise(async (resolve, reject) => {
        let walletDetails = await walletSchema.wallet.findOne({ userId: uId });

        if (walletDetails == null) {
          const walletItem = new walletSchema.wallet({
            userId: objectId(uId),
            balance: refund,
            transactions: transactionsObj,
          });
          await walletItem.save()
          
          
        } else {
          await walletSchema.wallet.updateOne(
            { userId: objectId(uId) },
            {
              $set: { balance: refund },
              $push: { transactions: transactionsObj },
            }
          );
        }
        //update product fund status
          await orderSchema.order.updateOne(
            {_id:oId},
            {
              $set:{orderStatus:'returned',paymentStatus:'refunded'}
            }
          )

        resolve()
      });
    } catch (error) {
      console.log("cannot refund or update");
    }
  },
  purchaseWithWallet:async(uId,oId,amount,walletFund)=>{
    try {
      let transObj = {
        _id: objectId(oId),
        type: "debit",
        amount: amount,
        createdAt : new Date(),
      };
      let walletBalance = parseInt(walletFund-amount)
      let result = await walletSchema.wallet.updateOne(
        { userId: objectId(uId) },
        {
          $set: { balance: walletBalance },
          $push: { transactions: transObj }
        }
      );
      return result
    } catch (error) {
      console.log('could not purchase with walllet balance');
    }

  },
  checkWalletBalance:async(uId)=>{
    try {
      let balance = await walletSchema.wallet.findOne({ userId: objectId(uId) })
      return balance
    } catch (error) {
      console.log('cannot find balance');
      
    }
  },

  emptyCart: async (uId) => {
    try {
      await cartSchema.cart.updateOne(
        { userId: objectId(uId) },
        { $set: { product: [] } }
      );
    } catch (error) {
      console.log("action not complete cart is not empty");
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

      // console.log('objectiddd',orderObj._id);

      //hashing id
      let id = orderObj._id;
      const hash = crypto.createHash("sha256");
      hash.update(id.toString());
      let userHashId = hash.digest("hex").slice(0, 6);

      orderObj.hashedId = userHashId;

      await orderObj.save();

      // add coupon to user schema
      if (couponCode !== "N/A") {
        await db.user.updateOne(
          { _id: userid },
          { $push: { coupons: couponCode } }
        );
      }

      return Promise.resolve(orderObj._id);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
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
              let discountedTotal =
                total - total * (couponExist.discountPercentage / 100);
              if (discountedTotal > couponExist.maxDiscountValue) {
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
                resolve({ couponValid, couponCode, updatedCartTotal });
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