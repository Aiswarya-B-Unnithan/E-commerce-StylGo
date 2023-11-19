// errorMiddleware.js
const errorMiddleware = (error, req, res, next) => {
    console.error('Error caught by the error handling middleware:', error);
  
    // Handle the error as needed, e.g., logging, responding to the client, etc.
    req.session.returnTo = req.originalUrl;
      if(req.originalUrl==='/addToCart'){
        req.session.returnTo=req.body.productDetailPgeUrl
      }
    res.status(500).render('errorPage', {layout: false,  error: error.message });
  };
  
  module.exports = errorMiddleware;


  