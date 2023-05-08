const adminHelper = require("../helpers/adminHelpers");
const userHelpers = require("../helpers/userHelpers");
const db = require("../model/connection");
const bannerSchema = require("../model/banner");
const multer = require("multer");
const objectId = require("mongodb").ObjectId;

// const userhelpers = require('../helpers/userhelpers')
const orderSchema = require("../model/orders");
const couponSchema = require("../model/coupon");
const { json } = require("express");

const adminCredential = {
  name: "superAdmin",
  email: "admin@gmail.com",
  password: "admin123",
};
let adminStatus;

module.exports = {
  showDashboard: async (req, res) => {
    let check = req.session.admin;
    if (adminStatus) {
      let saleData = await adminHelper.admin_dashboard();

      res.render("admin/admin-dash", {
        layout: "adminLayout",
        check,
        adminStatus,
        saleData,
      });
    } else {
      res.redirect("/admin/login");
    }
  },

  getAdminLogin: (req, res) => {
    if (req.session.adminloggedIn) {
      res.render("admin/admin-dash", { layout: "adminLayout", adminStatus });
    } else {
      res.render("admin/login", {
        layout: "adminLayout",
        adminStatus,
        invalidCredentials: false,
      });
    }
  },

  postAdminLogin: (req, res) => {
    if (
      req.body.email == adminCredential.email &&
      req.body.password == adminCredential.password
    ) {
      req.session.admin = adminCredential;
      req.session.adminIn = true;

      adminStatus = req.session.adminIn;

      res.redirect("/admin");
    } else {
      res.render("admin/login", {
        layout: "adminLayout",
        adminStatus,
        invalidCredentials: true,
      });
    }
  },

  adminLogout: (req, res) => {
    req.session.admin = null;
    adminStatus = false;
    req.session.adminIn = false;

    res.render("admin/login", { layout: "adminLayout", adminStatus });
  },

  getUserlist: async (req, res) => {
    //pageination
    const page = req.query.page || 1;
    const perPage = 10;
    const count = await db.user.countDocuments({});

    const orderListCount = count;

    adminHelper.listUsers(page, perPage).then((user) => {
      res.render("admin/view-users", {
        layout: "adminLayout",
        user,
        adminStatus,
        pages: Math.ceil(orderListCount / perPage),
      });
    });
  },

  addProducts: (req, res) => {
    adminHelper.findAllcategories().then((availCategory) => {
      res.render("admin/add-product", {
        layout: "adminLayout",
        adminStatus,
        availCategory,
      });
    });
  },

  postProducts: (req, res) => {
    let image = req.files.map((files) => files.filename);
    console.log(image);

    adminHelper.postAddProduct(req.body, image).then((response) => {
      res.redirect("/admin/view-product");
    });
  },

  viewProducts: async (req, res) => {
    //pageination
    const page = req.query.page || 1;
    const perPage = 10;
    const count = await db.products.countDocuments({});

    const orderListCount = count;

    let availCategory = await adminHelper.findAllcategories();
    adminHelper.getViewProducts(page, perPage).then((response) => {
      res.render("admin/view-product", {
        layout: "adminLayout",
        availCategory,
        response,
        adminStatus,
        pages: Math.ceil(orderListCount / perPage),
      });
    });
  },

  ViewProductDetails: (req, res) => {
    adminHelper.get_ViewProductDetails(req.params.id).then((response) => {
      res.render("admin/view-product-Detail", {
        layout: "adminLayout",
        response,
        adminStatus,
      });
    });
  },

  getCategory: (req, res) => {
    adminHelper.viewAddCategory().then((response) => {
      let viewCategory = response;
      let categorydelete = req.session.catexist;

      res.render("admin/add-category", {
        layout: "adminLayout",
        viewCategory,
        adminStatus,
        categorydelete,
      });
      req.session.catexist = true;

      categorydelete = true;
    });
  },

  postCategory: async (req, res) => {
    let categoryExist = await adminHelper.categoryCheck(req.body.category);
    let exist;
    console.log(categoryExist, "eeeeeieieie");
    if (categoryExist) {
      exist = true;
      res.json(exist);
    } else {
      await adminHelper.addCategory(req.body);
      exist = false;
      res.json(exist);
    }
  },

  deleteCategory: async (req, res) => {
    let catname = await adminHelper.catNames(req.body.proId);

    let categoriesExist = await adminHelper.findProductsWithCategory(catname);

    if (categoriesExist == 0) {
      adminHelper.delCategory(req.body.proId).then((response) => {
        res.json(true);
      });
    } else {
      res.json(false);
    }
  },

  get_EditCategory: (req, res) => {
    adminHelper.editcategory(req.params.id).then((response) => {
      let data = response;
      res.render("admin/edit-category", {
        layout: "adminLayout",
        data,
        adminStatus,
      });
    });
  },

  post_EditCategory: async (req, res) => {
    let categoryExist = await adminHelper.categoryCheck(req.body.categoryEdit);
    let exist;

    if (categoryExist) {
      exist = true;
      res.json(exist);
    } else {
      await adminHelper.postEditCategory(
        req.body.categoryId,
        req.body.categoryEdit
      );
      exist = false;
      res.json(exist);
    }
  },

  //edit product

  get_EditProduct: (req, res) => {
    adminHelper.viewAddCategory().then((response) => {
      var procategory = response;
      adminHelper.editProduct(req.params.id).then((response) => {
        var editproduct = response;

        console.log(editproduct);
        console.log(procategory);
        res.render("admin/edit-viewproduct", {
          layout: "adminLayout",
          editproduct,
          procategory,
          adminStatus,
        });
      });
    });
  },

  //posteditaddproduct

  post_EditProduct: async (req, res) => {
    // console.log(req.body);
    console.log("hellodfjdklfjkdf", req.files);
    let oldProductDetails = await adminHelper.editProduct(req.params.id);

    let oldImageArray = oldProductDetails.Image;
    let Editedimages = [];
    console.log(oldImageArray);

    if (req.files.image1) {
      Editedimages[0] = req.files.image1[0].filename;
    } else {
      Editedimages[0] = oldImageArray[0];
    }

    if (req.files.image2) {
      Editedimages[1] = req.files.image2[0].filename;
    } else {
      Editedimages[1] = oldImageArray[1];
    }

    if (req.files.image3) {
      Editedimages[2] = req.files.image3[0].filename;
    } else {
      Editedimages[2] = oldImageArray[2];
    }

    if (req.files.image4) {
      Editedimages[3] = req.files.image4[0].filename;
    } else {
      Editedimages[3] = oldImageArray[3];
    }

    adminHelper
      .postEditProduct(req.params.id, req.body, Editedimages)
      .then((response) => {
        console.log(response);
        // console.log(req.body);
        // console.log(req.file);
        res.redirect("/admin/view-product");
      });
  },

  //delete view product

  deleteTheProduct: (req, res) => {
    adminHelper.deleteProduct(req.body.id).then((response) => {
      res.json(true);
    });
  },

  // block user

  blockTheUser: (req, res) => {
    adminHelper.blockUser(req.params.id).then((response) => {
      res.redirect("/admin/view-users");
    });
  },

  unblockTheUser: (req, res) => {
    adminHelper.UnblockUser(req.params.id).then((response) => {
      res.redirect("/admin/view-users");
    });
  },

  get_bannerAdd: async (req, res) => {
    //pagination
    const page = req.query.page || 1;
    const perPage = 10;
    const count = await bannerSchema.banner.countDocuments({});
    const orderListCount = count;

    adminHelper.get_Allbanners(page, perPage).then((viewBanners) => {
      res.render("admin/banner-manage", {
        layout: "adminLayout",
        viewBanners,
        adminStatus,
        pages: Math.ceil(orderListCount / perPage),
      });
    });
  },

  post_bannerAdd: (req, res) => {
    let bannerImage = req.files.map((files) => files.filename);

    adminHelper.postAddBanner(req.body, bannerImage).then((response) => {
      res.redirect("/admin/add-banner");
    });
  },

  edit_banner: async (req, res) => {
    console.log("hellodfjdklfjkdf", req.files, req.body);
    let oldBannerDetails = await bannerSchema.banner.findOne({
      _id: objectId(req.body.id),
    });

    let oldBannerImgArray = oldBannerDetails.image;
    let Editedimg = [];

    if (req?.files?.bannerEditImg1) {
      Editedimg[0] = req.files.bannerEditImg1[0].filename;
    } else {
      Editedimg[0] = oldBannerImgArray[0];
    }

    if (req?.files?.bannerEditImg2) {
      Editedimg[1] = req.files.bannerEditImg2[0].filename;
    } else {
      Editedimg[1] = oldBannerImgArray[1];
    }

    if (req?.files?.bannerEditImg3) {
      Editedimg[2] = req.files.bannerEditImg3[0].filename;
    } else {
      Editedimg[2] = oldBannerImgArray[2];
    }

    adminHelper
      .postEditBanner(req.body.id, req.body, Editedimg)
      .then((response) => {
        console.log(response);
      });
  },
  find_banner: async (req, res) => {
    let banner = await bannerSchema.banner.findOne({ _id: req.query.id });
    res.json(banner);
  },

  list_banner: async (req, res) => {
    await bannerSchema.banner.updateOne(
      { _id: objectId(req.body) },
      { $set: { status: true, state: "Active" } }
    );

    res.json(true);
  },

  unList_banner: async (req, res) => {
    await bannerSchema.banner.updateOne(
      { _id: objectId(req.body) },
      { $set: { status: false, state: "Inactive" } }
    );

    res.json(true);
  },

  delete_banner: (req, res) => {
    adminHelper.delete_banner(req.body.id).then((response) => {
      res.json(true);
    });
  },

  //orders management

  get_all_orders: async (req, res) => {
    //pagination
    const page = req.query.page || 1;
    const perPage = 10;
    const count = await orderSchema.order.countDocuments({});
    console.log("count", count);
    const orderListCount = count;

    let allOrders = await adminHelper.all_orders(page, perPage);

    res.render("admin/admin-orders-page", {
      layout: "adminLayout",
      adminStatus,
      allOrders,
      pages: Math.ceil(orderListCount / perPage),
    });
  },

  get_adminOrdersExpand: async (req, res) => {
    let orderId = req.params.id;
    let orderdetail = await adminHelper.expandAdminOrders(orderId);
    res.render("admin/admin-order-detail", {
      layout: "adminLayout",
      adminStatus,
      orderdetail,
    });
  },

  updateProductStatus: async (req, res) => {
    let data = req.body.status;
    let orderId = req.body.order;

    await adminHelper
      .updateOrderStatus_admin(data, orderId)
      .then((response) => {
        res.redirect("/admin/all-orders");
      });
  },

  //coupons

  view_coupon: async (req, res) => {
    //pagination
    const page = req.query.page || 1;
    const perPage = 10;

    const count = await couponSchema.coupon.countDocuments({});

    const couponListCount = count;

    let couponslist = await adminHelper.getAllCoupons(page, perPage);
    res.render("admin/add-view-coupon", {
      layout: "adminLayout",
      adminStatus,
      couponslist,
      pages: Math.ceil(couponListCount / perPage),
    });
  },
  add_coupon: (req, res) => {
    adminHelper.post_coupons(req.body).then((response) => {
      res.redirect("/admin/view-coupons");
    });
  },
  get_coupon: async (req, res) => {
    let couponView = await couponSchema.coupon.findOne({ _id: req.query.id });
    res.json(couponView);
  },

  edit_coupon: async (req, res) => {
    await adminHelper.edit_coupons(req.body);
    res.json(true);
  },

  delete_coupon: async (req, res) => {
    let id = req.body.id;
    await adminHelper.removeCoupon(id);
    res.json(true);
  },

  //salesreport

  getSalesReport: (req, res) => {
    let response;
    res.render("admin/sales-report", {
      layout: "adminLayout",
      adminStatus,
      response,
    });
  },
  postSalesReport: async (req, res) => {
    const start = req.body.startdate;

    const end = req.body.enddate;
    const total = await adminHelper.salesTotal(start, end);
    adminHelper.salesReport(start, end).then((response) => {
      res.render("admin/sales-report", {
        layout: "adminLayout",
        total,
        adminStatus,
        response,
      });
    });
  },
};
