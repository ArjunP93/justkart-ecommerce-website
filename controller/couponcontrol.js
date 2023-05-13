const objectId = require("mongodb").ObjectId;
const couponSchema = require("../model/coupon");

const couponHelpers = require("../helpers/couponHelpers");


let adminStatus;

module.exports = {
  view_coupon: async (req, res) => {
    //pagination
    const page = req.query.page || 1;
    const perPage = 10;

    const count = await couponSchema.coupon.countDocuments({});

    const couponListCount = count;

    let couponslist = await couponHelpers.getAllCoupons(page, perPage);
    res.render("admin/add-view-coupon", {
      layout: "adminLayout",
      adminStatus:true,
      couponslist,
      pages: Math.ceil(couponListCount / perPage),
    });
  },
  add_coupon: (req, res) => {
    couponHelpers.post_coupons(req.body).then((response) => {
      res.redirect("/admin/view-coupons");
    });
  },
  get_coupon: async (req, res) => {
    let couponView = await couponSchema.coupon.findOne({ _id: req.query.id });
    res.json(couponView);
  },

  edit_coupon: async (req, res) => {
    await couponHelpers.edit_coupons(req.body);
    res.json(true);
  },

  delete_coupon: async (req, res) => {
    let id = req.body.id;
    await couponHelpers.removeCoupon(id);
    res.json(true);
  },
};
