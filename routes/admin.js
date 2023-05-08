var express = require("express");
const { getMaxListeners } = require("../app");
var router = express.Router();
const adminControl = require("../controller/admincontrol");
const adminHelper = require("../helpers/adminHelpers");
const db = require("../model/connection");
const multer = require("multer");
const photoload = require("../multer/multer");

const authentication = require("../middleware/middlewares");
const admincontrol = require("../controller/admincontrol");

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
  .get(adminControl.addProducts)
  .post(photoload.uploads, adminControl.postProducts);

router.get(
  "/view-product",
  authentication.adminAuth,
  adminControl.viewProducts
);
router.get("/view-product-Details/:id", admincontrol.ViewProductDetails);

router
  .route("/edit-product/:id")
  .all(authentication.adminAuth)
  .get(adminControl.get_EditProduct)

  .post(photoload.editeduploads, adminControl.post_EditProduct);

router.get("/add-category", authentication.adminAuth, adminControl.getCategory);

router.post("/add-category", adminControl.postCategory);

router.get(
  "/edit-category/:id",
  authentication.adminAuth,
  admincontrol.get_EditCategory
);
router.post(
  "/edit-category",
  authentication.adminAuth,
  admincontrol.post_EditCategory
);

router.delete(
  "/delete-product",
  authentication.adminAuth,
  adminControl.deleteTheProduct
);

router.delete(
  "/delete-category",
  authentication.adminAuth,
  adminControl.deleteCategory
);

router.get(
  "/all-orders",
  authentication.adminAuth,
  admincontrol.get_all_orders
);

router.get("/view-admin-order-expand/:id", admincontrol.get_adminOrdersExpand);

router.post(
  "/update-status",
  authentication.adminAuth,
  adminControl.updateProductStatus
);

router
  .route("/add-banner")
  .all(authentication.adminAuth)
  .get(adminControl.get_bannerAdd)
  .post(photoload.bannerAdd, admincontrol.post_bannerAdd);

router.get("/get-banner", authentication.adminAuth, adminControl.find_banner);
router.put(
  "/edit-banner",
  photoload.bannerEdit,
  authentication.adminAuth,
  adminControl.edit_banner
);
router.put("/list-banner", authentication.adminAuth, adminControl.list_banner);
router.put(
  "/unlist-banner",
  authentication.adminAuth,
  adminControl.unList_banner
);
router.delete(
  "/delete-banner",
  authentication.adminAuth,
  adminControl.delete_banner
);

router.get("/view-coupons", authentication.adminAuth, adminControl.view_coupon);
router.post("/add-coupon", authentication.adminAuth, adminControl.add_coupon);
router.put("/edit-coupon", authentication.adminAuth, adminControl.edit_coupon);
router.get("/get-coupon", authentication.adminAuth, adminControl.get_coupon);
router.delete(
  "/delete-coupon",
  authentication.adminAuth,
  adminControl.delete_coupon
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
