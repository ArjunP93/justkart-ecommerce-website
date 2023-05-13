const bannerHelpers = require("../helpers/bannerHelpers");
const bannerSchema = require("../model/banner");
const multer = require("multer");
const objectId = require("mongodb").ObjectId;

let adminStatus;
module.exports = {
  get_bannerAdd: async (req, res) => {
    //pagination
    const page = req.query.page || 1;
    const perPage = 10;
    const count = await bannerSchema.banner.countDocuments({});
    const orderListCount = count;

    bannerHelpers.get_Allbanners(page, perPage).then((viewBanners) => {
      res.render("admin/banner-manage", {
        layout: "adminLayout",
        viewBanners,
        adminStatus:true,
        pages: Math.ceil(orderListCount / perPage),
      });
    });
  },

  post_bannerAdd: (req, res) => {
    let bannerImage = req.files.map((files) => files.filename);

    bannerHelpers.postAddBanner(req.body, bannerImage).then((response) => {
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

    bannerHelpers
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
    bannerHelpers.delete_banner(req.body.id).then((response) => {
      res.json(true);
    });
  },
};
