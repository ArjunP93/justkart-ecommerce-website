var express = require("express");
var router = express.Router();
const controller = require("../controller/usercontrol");
const authentication = require("../middleware/middlewares");
const cartcontrol = require("../controller/cartcontrol");

const userordercontrol = require("../controller/userordercontrol");

/* GET home page. */
router.get("/", controller.getHome);

router.post("/search", controller.find_items);

router.route("/login").get(controller.showLogin).post(controller.postLogin);

router
  .route("/signup")

  .get(controller.showSignup)
  .post(controller.postSignup);

router.get(
  "/account",
  authentication.userAuth,
  authentication.blockuserStatus,
  controller.get_Account
);
router.post(
  "/add-address",
  authentication.userAuth,
  authentication.blockuserStatus,
  controller.post_addAddress
);

router.delete('/delete-address',controller.remove_Address)

router.get("/shop", controller.shopView);

router.get("/logout", controller.userlogout);

router.get("/shop-product/:id",controller.productPage);


router.get("/category-filter/:id", controller.categoryFiltering);

router.get(
  "/add-to-cart",
  authentication.userAuth,
  authentication.blockuserStatus,
  cartcontrol.ajaxAddToCart
);

router.get(
  "/show-user-cart",
  authentication.userAuth,
  authentication.blockuserStatus,
  cartcontrol.ajaxViewCart
);

router.post(
  "/update-cart",
  authentication.userAuth,
  authentication.blockuserStatus,
  cartcontrol.ajaxUpdatecart
);

router.delete(
  "/delete-product-cart",
  authentication.userAuth,
  authentication.blockuserStatus,
  cartcontrol.deleteInCart
);

router.get(
  "/cart-total",
  authentication.userAuth,
  authentication.blockuserStatus,
  cartcontrol.ajaxCartTotal
);

router.get(
  "/add-to-wishlist",
  authentication.userAuth,
  authentication.blockuserStatus,
  controller.addToWishlist
);
router.get(
  "/view-wishlist",
  authentication.userAuth,
  authentication.blockuserStatus,
  controller.getwishlist
);
router.post(
  "/add-cart-wishlist",
  authentication.userAuth,
  authentication.blockuserStatus,
  controller.postAddCartWishlist
);
router.delete(
  "/delete-wishlist",
  authentication.userAuth,
  authentication.blockuserStatus,
  controller.deleteWishlist
);

router.get(
  "/checkout",
  authentication.userAuth,
  authentication.blockuserStatus,
  controller.checkout
);
router.post(
  "/checkout",
  authentication.userAuth,
  authentication.blockuserStatus,
  controller.post_checkout
);

router.post(
  "/wallet-payment-check",
  authentication.userAuth,
  authentication.blockuserStatus,
  controller.post_check_wallet
);

router.post(
  "/verify-payment",
  authentication.userAuth,
  controller.payment_verify
);

router.get(
  "/order-details",
  authentication.userAuth,
  authentication.blockuserStatus,
  userordercontrol.get_orderDetails
);

router.post(
  "/cancel-order",
  authentication.userAuth,
  userordercontrol.post_cancel_order
);

router.post(
  "/return-products",
  authentication.userAuth,
  userordercontrol.post_return_order
);

router.get(
  "/view-user-order-expand/:id",
  authentication.userAuth,
  authentication.blockuserStatus,
  userordercontrol.get_userOrdersExpand
);

router.post(
  "/coupon-verify",
  authentication.userAuth,
  controller.Post_verifyCoupon
);

router.get("/otp", controller.getOtp);
router.post("/otp-signin", controller.postotp);

module.exports = router;
