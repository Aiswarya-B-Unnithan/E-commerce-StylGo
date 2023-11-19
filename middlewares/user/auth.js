
const User=require('../../models/user')

const isUserAuthenticated = (req, res, next) => {
    if (req.session.authenticated) {
      next();
    } else {
      req.session.returnTo = req.originalUrl;
      console.log('from auth ',req.session.returnTo,req.originalUrl)
      if(req.originalUrl==='/addToCart'){
        req.session.returnTo=req.body.productDetailPgeUrl
      }
      
      res.redirect("/login");
    }
  };
  const isUserUnBlocked=async(req,res,next)=>{
    try{
      const user=await User.findOne({ email: req.session.user.email })
      if(!(user.isBlocked)){
        next()
      }else{
        res.redirect("/login");
      }

    }catch(e){
      console.log('auth err',e)
    }

  }
const isNewUser=(req, res, next) => {
        if (!(req.session.authenticated)) {
          next();
        } else {
          res.redirect("/profile");
        }
      };

  module.exports={
    isUserAuthenticated,
    isNewUser,
    isUserUnBlocked
  }