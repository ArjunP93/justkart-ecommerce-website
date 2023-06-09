const userhelpers = require("../helpers/userHelpers");
const { category, user } = require("../model/connection");
const objectId = require("mongodb").ObjectId;
const orderSchema = require("../model/orders");
const db = require("../model/connection");
const bannerSchema = require("../model/banner");
const productHelpers = require("../helpers/productHelpers");
const userorderHelpers = require("../helpers/userorderHelpers");
const cartHelpers = require("../helpers/cartHelpers");

var loginheader, loginStatus;

module.exports = {
  getHome: async (req, res) => {
    let bannerresponse = await bannerSchema.banner.find({
      status: true,
    });
    let newlyAdded = await db.products.find().sort({ CreatedAt: -1 }).limit(4);

    if (loginStatus) {
      let userId = req?.session?.user?._id;
      let count = await userhelpers.cart_wishlist_count(userId);

      res.render("user/userhome", {
        loginheader: true,
        bannerresponse,
        cartCount: count.cartCount,
        wishCount: count.wishCount,
        newlyAdded,
      });
    } else {
      res.render("user/userhome", {
        loginheader: false,
        bannerresponse,
        newlyAdded,
        cartCount:0,
        wishCount:0

      });
    }
  },
  find_items: async (req, res) => {
    // pagination

    const page = req.query.page || 1;
    const perPage = 10;
    const count = await db.products.countDocuments({});

    const orderListCount = count;

    const searchText = req.body.search;
    console.log("search Input:", searchText);
    const searchQuery = {
      Productname: { $regex: searchText, $options: "i" },
    };

    const pData = await db.products
      .find(searchQuery)
      .skip((page - 1) * perPage)
      .limit(perPage);
    console.log("produt data", pData);

    productHelpers.findAllcategories().then(async (cat) => {
      if (req.session.userIn) {
        let userId = req.session.user._id;
        let count = await userhelpers.cart_wishlist_count(userId);
        res.render("user/shop", {
          response: pData,
          cat,
          loginheader: true,
          cartCount: count.cartCount,
          wishCount: count.wishCount,
          pages: Math.ceil(orderListCount / perPage),
        });
      } else {
        res.render("user/shop", {
          response: pData,
          cat,
          pages: Math.ceil(orderListCount / perPage),
        });
      }
    });
  },
  showLogin: (req, res) => {
    if (req.session.userIn) {
      res.redirect("/");
    } else {
      res.render("user/login");
    }
  },

  postLogin: (req, res) => {
    userhelpers.dologin(req.body).then((response) => {
      console.log("dologin : ", response.user);

      loginheader = true;
      loginStatus = response.status;
      console.log(loginStatus);
      var blockedStatus = response.blockedStatus;
      req.session.user = response.user;
      console.log("session:", req.session.user);

      if (loginStatus) {
        req.session.userIn = true;

        res.redirect("/");
      } else {
        res.render("user/login", {
          loginStatus,
          blockedStatus,
          login: false,
        });
      }
    });
  },

  shopView: async (req, res) => {
    // pagination

    const page = req.query.page || 1;
    const perPage = 10;
    const count = await db.products.countDocuments({});
    console.log("count", count);
    const orderListCount = count;

    userhelpers.listProductShop(page, perPage).then((response) => {
      productHelpers.findAllcategories().then(async (cat) => {
        if (req.session.userIn) {
          let userId = req.session.user._id;
          let count = await userhelpers.cart_wishlist_count(userId);
          res.render("user/shop", {
            response,
            cat,
            loginheader: true,
            cartCount: count.cartCount,
            wishCount: count.wishCount,
            pages: Math.ceil(orderListCount / perPage),
          });
        } else {
          res.render("user/shop", {
            response,
            cat,
            pages: Math.ceil(orderListCount / perPage),
          });
        }
      });
    });
  },

  showSignup: (req, res) => {
    res.render("user/signup", { emailStatus: true });
  },

  postSignup: (req, res) => {
    userhelpers.doSignUp(req.body).then((response) => {
      var emailStatus = response.status;
      loginStatus = response.status;
      if (emailStatus) {
        req.session.user = response.data;

        req.session.userIn = true;

        res.redirect("/");
      } else {
        res.render("user/signup", { emailStatus });
      }
    });
  },

  userlogout: (req, res) => {
    loginheader = false;
    loginStatus = false;
    req.session.user = null;
    req.session.userIn = false;

    res.redirect("/");
  },

  productPage: (req, res) => {
    userhelpers.viewProductDetails(req.params.id).then(async (response) => {
      if (req.session.user) {
        let userId = req.session.user._id;
        let count = await userhelpers.cart_wishlist_count(userId);
        response.userId = userId;

        res.render("user/shop-product", {
          response,
          cartCount: count.cartCount,
          wishCount: count.wishCount,
        });
      } else {
        res.render("user/shop-product", { response });
      }
    });
  },
  categoryFiltering: async (req, res) => {
    let userId = req.session?.user?._id;
    let categoryName = await userhelpers.findCategoryName(req.params.id);
    console.log("catname", categoryName);

    // pagination

    const page = req.query.page || 1;
    const perPage = 10;
    const count = await db.products
      .find({ category: categoryName })
      .countDocuments({});

    const orderListCount = count;

    let cat = await productHelpers.findAllcategories();

    await userhelpers
      .findAllProducts(categoryName, page, perPage)
      .then(async (response) => {
        if (req.session.user) {
          let count = await userhelpers.cart_wishlist_count(userId);

          res.render("user/shop", {
            response,
            cat,
            loginheader: true,
            cartCount: count.cartCount,
            wishCount: count.wishCount,
            pages: Math.ceil(orderListCount / perPage),
          });
        } else {
          res.render("user/shop", {
            response,
            cat,
            loginheader: true,
            pages: Math.ceil(orderListCount / perPage),
          });
        }
      });
  },

  getOtp: (req, res) => {
    res.render("user/otp");
  },
  postotp: (req, res) => {
    userhelpers
      .otpLogin(req.body.mobile)
      .then((data) => {
        if (data.blocked) {
          loginStatus = false;
          res.redirect("/login");
        } else {
          req.session.userIn = true;
          loginStatus = true;
          req.session.user = data;

          res.redirect("/login");
        }
      })
      .catch(() => {
        console.log(err);
      });
  },

  addToWishlist: async (req, res) => {
    console.log("adde == to wishlist");
    const userId = req.session.user._id;
    const proId = req.query.proId;
    userhelpers.addTowishlistHelp(userId, proId).then((data) => {
      res.json(data);
    });
  },
  getwishlist: async (req, res) => {
    console.log("inside wishlist control");
    const userId = req.session.user._id;
    userhelpers.viewWishlist(userId).then(async (response) => {
      let count = await userhelpers.cart_wishlist_count(userId);

      res.render("user/wishlist", {
        loginheader: true,
        cartCount: count.cartCount,
        wishCount: count.wishCount,
        response,
      });
    });
  },
  postAddCartWishlist: async (req, res) => {
    let productId = req.body.proId;
    let price = parseInt(req.body.price);
    let userId = req.session.user._id;
    let temp = req.body.quantity;
    let qty = parseInt(temp);
    let subt = parseInt(qty * price);

    console.log("log subtotal", subt);

    cartHelpers
      .addToCart_post(productId, userId, qty, subt)
      .then((response) => {
        userhelpers.deleteFromWishlist(productId, userId).then((result) => {
          res.json(true);
        });
      });
  },
  deleteWishlist: (req, res) => {
    const userId = req.session.user._id;
    const product = req.body.proId;
    userhelpers.deleteFromWishlist(product, userId).then((response) => {
      res.json(true);
    });
  },

  checkout: async (req, res) => {
    let userid = req.session.user._id;

    let addressFetch = await userhelpers.getAddress(userid);
    let address = addressFetch ? addressFetch : { Address: [] };
    let cart = await cartHelpers.viewUser_cart(userid);
    let total_checkout = await cartHelpers.cartTotal(userid);
    let count = await userhelpers.cart_wishlist_count(userid);

    res.render("user/checkout", {
      address,
      cart,
      total_checkout,
      cartCount: count.cartCount,
      wishCount: count.wishCount,
      loginheader: true,
    });
  },
  post_checkout: async (req, res) => {
    let userid = req.session.user._id;
    let userInfo = await userhelpers.userDetails(userid);
    console.log('id in checkout',userInfo);

    let cart = await cartHelpers.viewCart_aggregate(userid);
    req.session.latestCoupon = req.body.couponCode;

    //coupon code null check
    let couponCode;
    if (req.body.couponCode == "N/A") {
      couponCode = "N/A";
    } else {
      couponCode = req.body.couponCode;
    }

    let total_checkout;
    console.log("req.body.couponCode", req.body.couponCode);

    // console.log('req.body.totslsl',req.body.totalWithCoupon);
    if (req.body.couponCode == "N/A") {
      total_Aggregate = await cartHelpers.cartTotal(userid);
      total_checkout = total_Aggregate[0].total;
    } else {
      total_checkout = parseInt(req.body.totalWithCoupon);
    }

    let selectedAddress = await userhelpers.getSelectedAddress(
      req.body.address,
      userid
    );

    let shippingAddressObj = {
      firstName: selectedAddress.Address[0].firstName,
      lastName: selectedAddress.Address[0].lastName,
      street: selectedAddress.Address[0].street,
      building: selectedAddress.Address[0].building,
      city: selectedAddress.Address[0].city,
      state: selectedAddress.Address[0].state,
      pincode: selectedAddress.Address[0].pincode,
      mobile: selectedAddress.Address[0].mobile,
    };
    let payStatus;
    if (
      req.body.paymentMethod === "online" ||
      req.body.paymentMethod === "wallet" ||
      req.body.paymentMethod === "wallet+online"
    ) {
      payStatus = "pending";
    } else {
      payStatus = "success";
    }

    //wallet payment

    await userhelpers
      .createOrder(
        userid,
        userInfo,
        cart,
        req.body.paymentMethod,
        couponCode,
        payStatus,
        total_checkout,
        shippingAddressObj
      )
      .then(async (orderId) => {
        let response = {};

        req.session.latestOrder = orderId;

        if (req.body.paymentMethod === "COD") {
          userhelpers.couponAddtoUser(couponCode, userid);
          cartHelpers.emptyCart(userid);
          response.COD = true;
          res.json(response);
        } else if (req.body.paymentMethod === "online") {
          userhelpers.getRazorpay(orderId, total_checkout).then((response) => {
            response.razorpay = true;
            res.json(response);
          });
        } else if (req.body.paymentMethod === "wallet+online") {
          let wallet = await userhelpers.checkWalletBalance(userid);
          if (wallet) {
            await userhelpers.purchaseWithWallet(
              userid,
              orderId,
              parseInt(wallet.balance),
              parseInt(wallet.balance)
            );
          } else {
          }
          await userhelpers.purchaseWithWallet(userid, orderId);
          await userhelpers
            .getRazorpay(orderId, req.body.payableBalance)
            .then((response) => {
              response.razorpay = true;
              res.json(response);
            });
          //wallet payment
        } else {
          let amountToPay = total_checkout;

          userhelpers.checkWalletBalance(userid).then((result) => {
            console.log("balance", result);
            let walletbalance = result == null ? 0 : result.balance;
            if (result == null) {
              response.wallet = false;
              res.json(response);
            } else if (walletbalance < amountToPay) {
              response.wallet = true;
              response.balanceError = true;
              response.walletbalance = walletbalance;

              res.json(response);
            } else {
              userhelpers
                .purchaseWithWallet(
                  userid,
                  orderId,
                  parseInt(amountToPay),
                  parseInt(walletbalance)
                )
                .then(async () => {
                  await userhelpers.updateOrderPayment(orderId);
                  await userhelpers.couponAddtoUser(couponCode, userid);
                  await cartHelpers.emptyCart(userid);
                  response.wallet = true;
                  response.balanceError = false;
                  response.walletbalance = walletbalance;
                  res.json(response);
                });
            }
          });
        }
      });
  },
  post_check_wallet: (req, res) => {
    let amountToPay = parseInt(req.body.total);
    let walletPlusOnline = req.body.status;
    let userId = req.session.user._id;
    console.log("amountToPay", amountToPay);

    userhelpers.checkWalletBalance(userId).then((result) => {
      console.log("balance", result);
      let walletbalance = result == null ? 0 : result.balance;
      if (walletbalance < amountToPay) {
        if (walletPlusOnline) {
          res.json({ payable: true, walletbalance });
        } else {
          res.json({ balanceError: true, walletbalance });
        }
      } else {
        res.json({ balanceError: false, walletbalance });
      }
    });
  },

  payment_verify: (req, res) => {
    let couponCode = req.session.latestCoupon;
    let payment = req.body.payment;
    let orderId = req.session.latestOrder;
    let userId = req.session.user._id;
    userhelpers.verifyPayment(req.body).then(async (success) => {
      if (success.status) {
        await userhelpers.updateOrderPayment(orderId);
        await userhelpers.couponAddtoUser(couponCode, userId);
        await cartHelpers.emptyCart(userId);
        res.json(true);
      }
    });
  },

  get_Account: async (req, res) => {
    let userId = req.session.user._id;
    // pageination
    const page = req.query.page || 1;
    const perPage = 10;
    const count = await orderSchema.order.countDocuments({
      userid: userId,
    });
    console.log("count", count);
    const orderListCount = count;

    let multipleAddress = await userhelpers.getAddress(userId);
    let addressCount;
    if (multipleAddress) {
      addressCount = multipleAddress.Address.length;
    } else {
      addressCount = 0;
    }

    let orders = await userorderHelpers.fetchUserOrders(userId, page, perPage);

    let walletResponse = await userhelpers.checkWalletBalance(userId);

    let countHead = await userhelpers.cart_wishlist_count(userId);

    res.render("user/profile", {
      loginheader: true,
      multipleAddress,
      cartCount: countHead.cartCount,
      wishCount: countHead.wishCount,
      addressCount,
      orders,
      walletResponse,
      pages: Math.ceil(orderListCount / perPage),
    });
  },

  post_addAddress: (req, res) => {
    let userId = req.session.user._id;

    userhelpers.addAdress(userId, req.body).then((response) => {
      res.redirect("/account");
    });
  },
  remove_Address: async (req, res) => {
    let userId = req.session.user._id;
    let addressid = req.body.id;
    await db.address.updateOne(
      { userid: objectId(userId) },
      { $pull: { Address: { _id: objectId(addressid) } } }
    );
    res.json(true);
  },

  Post_verifyCoupon: (req, res) => {
    let userId = req.session.user._id;
    let couponCode = req.body.code;
    let total = req.body.total;

    userhelpers.verifyCouponCode(userId, total, couponCode).then((response) => {
      res.json(response);
    });
  },
};
