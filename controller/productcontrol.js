const productHelpers = require("../helpers/productHelpers");

const db = require("../model/connection");

const objectId = require("mongodb").ObjectId;

let adminStatus;

module.exports = {
  addProducts: (req, res) => {
    productHelpers.findAllcategories().then((availCategory) => {
      res.render("admin/add-product", {
        layout: "adminLayout",
        adminStatus:true,
        availCategory,
      });
    });
  },

  postProducts: (req, res) => {
    let image = req.files.map((files) => files.filename);
    console.log(image);

    productHelpers.postAddProduct(req.body, image).then((response) => {
      res.redirect("/admin/view-product");
    });
  },

  viewProducts: async (req, res) => {
    //pageination
    const page = req.query.page || 1;
    const perPage = 10;
    const count = await db.products.countDocuments({});

    const orderListCount = count;

    let availCategory = await productHelpers.findAllcategories();
    productHelpers.getViewProducts(page, perPage).then((response) => {
      res.render("admin/view-product", {
        layout: "adminLayout",
        availCategory,
        response,
        adminStatus:true,
        pages: Math.ceil(orderListCount / perPage),
      });
    });
  },

  ViewProductDetails: (req, res) => {
    productHelpers.get_ViewProductDetails(req.params.id).then((response) => {
      res.render("admin/view-product-Detail", {
        layout: "adminLayout",
        response,
        adminStatus:true,
      });
    });
  },

  getCategory: (req, res) => {
    productHelpers.viewAddCategory().then((response) => {
      let viewCategory = response;
      let categorydelete = req.session.catexist;

      res.render("admin/add-category", {
        layout: "adminLayout",
        viewCategory,
        adminStatus:true,
        categorydelete,
      });
      req.session.catexist = true;

      categorydelete = true;
    });
  },

  postCategory: async (req, res) => {
    let categoryExist = await productHelpers.categoryCheck(req.body.category);
    let exist;
    console.log(categoryExist, "eeeeeieieie");
    if (categoryExist) {
      exist = true;
      res.json(exist);
    } else {
      await productHelpers.addCategory(req.body);
      exist = false;
      res.json(exist);
    }
  },

  deleteCategory: async (req, res) => {
    let catname = await productHelpers.catNames(req.body.proId);

    let categoriesExist = await productHelpers.findProductsWithCategory(
      catname
    );

    if (categoriesExist == 0) {
      productHelpers.delCategory(req.body.proId).then((response) => {
        res.json(true);
      });
    } else {
      res.json(false);
    }
  },

  get_EditCategory: (req, res) => {
    productHelpers.editcategory(req.params.id).then((response) => {
      let data = response;
      res.render("admin/edit-category", {
        layout: "adminLayout",
        data,
        adminStatus:true,
      });
    });
  },

  post_EditCategory: async (req, res) => {
    let categoryExist = await productHelpers.categoryCheck(
      req.body.categoryEdit
    );
    let exist;

    if (categoryExist) {
      exist = true;
      res.json(exist);
    } else {
      await productHelpers.postEditCategory(
        req.body.categoryId,
        req.body.categoryEdit
      );
      exist = false;
      res.json(exist);
    }
  },

  //edit product

  get_EditProduct: (req, res) => {
    productHelpers.viewAddCategory().then((response) => {
      var procategory = response;
      productHelpers.editProduct(req.params.id).then((response) => {
        var editproduct = response;

        res.render("admin/edit-viewproduct", {
          layout: "adminLayout",
          editproduct,
          procategory,
          adminStatus:true,
        });
      });
    });
  },

  //posteditaddproduct

  post_EditProduct: async (req, res) => {
    let oldProductDetails = await productHelpers.editProduct(req.params.id);

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

    productHelpers
      .postEditProduct(req.params.id, req.body, Editedimages)
      .then((response) => {
        res.redirect("/admin/view-product");
      });
  },

  //delete view product

  deleteTheProduct: (req, res) => {
    productHelpers.deleteProduct(req.body.id).then((response) => {
      res.json(true);
    });
  },
};
