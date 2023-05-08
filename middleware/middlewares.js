const adminHelper = require("../helpers/adminHelpers");

module.exports = {
  userAuth: (req, res, next) => {
    if (req.session.userIn) {
      next();
    } else {
      res.redirect("/login");
    }
  },

  adminAuth: (req, res, next) => {
    if (req.session.adminIn) {
      next();
    } else {
      res.redirect("/admin/login");
    }
  },
  blockuserStatus: (req, res, next) => {
    let Uid = req.session.user._id;
    console.log("uid:", Uid);

    adminHelper.blockedUserMiddlewareHelper(Uid).then((data) => {
      if (!data.blocked) {
        next();
      } else {
        res.redirect("/logout");
      }
    });
  },
};
