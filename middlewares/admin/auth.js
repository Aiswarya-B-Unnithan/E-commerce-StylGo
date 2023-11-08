const isAdminAuthenticated = (req, res, next) => {
    if (req.session.adminAuthenticated) {
      next();
    } else {
      res.redirect("/admin");
    }
  };

  module.exports={
    isAdminAuthenticated,
  }