const adminHelper = require("../helpers/adminHelpers");

const db = require("../model/connection");

const multer = require("multer");
const objectId = require("mongodb").ObjectId;

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
