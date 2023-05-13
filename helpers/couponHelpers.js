
const objectId = require("mongodb").ObjectId;
const couponSchema = require("../model/coupon");
const voucher = require("voucher-code-generator");





module.exports={

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
  }

}