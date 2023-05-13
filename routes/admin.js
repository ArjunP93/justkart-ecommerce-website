var express = require("express");
const { getMaxListeners } = require("../app");
var router = express.Router();
const adminControl = require("../controller/admincontrol");
const adminHelper = require("../helpers/adminHelpers");
const db = require("../model/connection");
const multer = require("multer");
const photoload = require("../multer/multer");

const authentication = require("../middleware/middlewares");

const couponcontrol = require("../controller/couponcontrol");
const bannercontrol = require("../controller/bannercontrol");
const ordercontrol = require("../controller/ordercontrol");
const productcontrol = require("../controller/productcontrol");

router.get("/", authentication.adminAuth, adminControl.showDashboard);

router
  .route("/login")
  .get(adminControl.getAdminLogin)
  .post(adminControl.postAdminLogin);

router.get("/logout", adminControl.adminLogout);

router.get("/view-users", authentication.adminAuth, adminControl.getUserlist);

router.get(
  "/block-users/:id",
  authentication.adminAuth,
  adminControl.blockTheUser
);

router.get(
  "/unblock-users/:id",
  authentication.adminAuth,
  adminControl.unblockTheUser
);

router
  .route("/add-product")
  .all(authentication.adminAuth)
  .get(productcontrol.addProducts)
  .post(photoload.uploads, productcontrol.postProducts);

router.get(
  "/view-product",
  authentication.adminAuth,
  productcontrol.viewProducts
);
router.get("/view-product-Details/:id", productcontrol.ViewProductDetails);

router
  .route("/edit-product/:id")
  .all(authentication.adminAuth)
  .get(productcontrol.get_EditProduct)

  .post(photoload.editeduploads, productcontrol.post_EditProduct);

router.get("/add-category", authentication.adminAuth, productcontrol.getCategory);

router.post("/add-category", productcontrol.postCategory);

router.get(
  "/edit-category/:id",
  authentication.adminAuth,
  productcontrol.get_EditCategory
);
router.post(
  "/edit-category",
  authentication.adminAuth,
  productcontrol.post_EditCategory
);

router.delete(
  "/delete-product",
  authentication.adminAuth,
  productcontrol.deleteTheProduct
);

router.delete(
  "/delete-category",
  authentication.adminAuth,
  productcontrol.deleteCategory
);

router.get(
  "/all-orders",
  authentication.adminAuth,
  ordercontrol.get_all_orders
);

router.get("/view-admin-order-expand/:id", ordercontrol.get_adminOrdersExpand);

router.post(
  "/update-status",
  authentication.adminAuth,
  ordercontrol.updateProductStatus
);

router
  .route("/add-banner")
  .all(authentication.adminAuth)
  .get(bannercontrol.get_bannerAdd)
  .post(photoload.bannerAdd, bannercontrol.post_bannerAdd);

router.get("/get-banner", authentication.adminAuth, bannercontrol.find_banner);
router.put(
  "/edit-banner",
  photoload.bannerEdit,
  authentication.adminAuth,
  bannercontrol.edit_banner
);
router.put("/list-banner", authentication.adminAuth, bannercontrol.list_banner);
router.put(
  "/unlist-banner",
  authentication.adminAuth,
  bannercontrol.unList_banner
);
router.delete(
  "/delete-banner",
  authentication.adminAuth,
  bannercontrol.delete_banner
);

router.get("/view-coupons", authentication.adminAuth, couponcontrol.view_coupon);
router.post("/add-coupon", authentication.adminAuth, couponcontrol.add_coupon);
router.put("/edit-coupon", authentication.adminAuth, couponcontrol.edit_coupon);
router.get("/get-coupon", authentication.adminAuth, couponcontrol.get_coupon);
router.delete(
  "/delete-coupon",
  authentication.adminAuth,
  couponcontrol.delete_coupon
);

//sales report
router.get(
  "/sales-report",
  authentication.adminAuth,
  adminControl.getSalesReport
);
router.post(
  "/sales-report",
  authentication.adminAuth,
  adminControl.postSalesReport
);

module.exports = router;
