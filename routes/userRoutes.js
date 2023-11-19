const express=require('express')
const Router=express.Router()
const shopController=require('../controllers/shopController')
const userController=require('../controllers/userController')
const middlewares=require('../middlewares/user/auth')
const upload=require('../config/multer')
const profileController=require('../controllers/profileController')
const cartController=require('../controllers/cartController')
const checkoutController=require('../controllers/checkoutController')
const contactController=require('../controllers/contactController')

//=====================Home, Shop=============================
Router.get('/',shopController.getHome)
Router.get('/shop',shopController.getShop)
Router.get('/shop/filter',shopController.getShopFilter)
Router.post('/shop/filter',shopController.getShopFilter)
Router.get('/searchProduct',shopController.getSearchProduct)
//Router.get('/contact',userController.getContact)
Router.get('/productDetail/:id',shopController.getProductDetail)

//====================Sign in & Sign up=========================
Router.get('/login',middlewares.isNewUser,userController.getLogin)
Router.post('/login',userController.postLogin)
Router.post('/otp',userController.postOtp)
Router.post('/resend',userController.postResend)
Router.get('/signUp',middlewares.isNewUser,userController.getSignUp)
Router.post('/signUp',middlewares.isNewUser,userController.postSignUp)
Router.post('/logout',userController.postLogout)


//=================Profile======================================
Router.get('/profile',middlewares.isUserAuthenticated,middlewares.isUserUnBlocked,profileController.getProfile)
Router.post('/profile/addAddress',profileController.addAddress)
Router.post('/profile/addImage',middlewares.isUserAuthenticated,upload.single('image'),profileController.addProfileImage)
Router.post('/profile/edit',middlewares.isUserAuthenticated,profileController.editProfile)
Router.post('/profile/changePassword',middlewares.isUserAuthenticated,profileController.changePassword)
Router.get('/profile/editAddress/:index',middlewares.isUserAuthenticated,middlewares.isUserUnBlocked,profileController.editAddress)
Router.post('/profile/editAddress/:index',middlewares.isUserAuthenticated,profileController.postEditAddress)
Router.post('/profile/order-action/:orderId',middlewares.isUserAuthenticated,profileController.orderAction)


//========================Cart======================================
Router.get('/cart',middlewares.isUserAuthenticated,middlewares.isUserUnBlocked,cartController.getCart)
Router.post('/addToCart',middlewares.isUserAuthenticated,cartController.addToCart)
Router.post('/cart/edit/increment/:productDetails',middlewares.isUserAuthenticated,cartController.incrementCartData)
Router.post('/cart/edit/decrement/:productDetails',middlewares.isUserAuthenticated,cartController.decrementCartData)
Router.delete('/cart/deleteItem/:productDetails',middlewares.isUserAuthenticated,cartController.deleteCartItem)


//============================Checkout===============================
Router.get('/checkout',middlewares.isUserAuthenticated,middlewares.isUserUnBlocked,checkoutController.getCheckout)
Router.post('/checkout/addAddress',middlewares.isUserAuthenticated,checkoutController.addAddressCheckout)
Router.post('/checkout/place-order',middlewares.isUserAuthenticated,checkoutController.placeOrder)
Router.post('/checkout/applyCoupon',middlewares.isUserAuthenticated,checkoutController.applyCoupon)
Router.post('/checkout/removeCoupon',middlewares.isUserAuthenticated,checkoutController.removeCoupon)

//Router.get('/checkout/create-payment',middlewares.isUserAuthenticated,userController.orderPayment)
//Router.get('/successPayment',userController.successPayment)
Router.get('/afterPlaceOrder/:orderId',checkoutController.afterPlaceOrder)
Router.get('/afterPlaceOrderFail/:orderId',checkoutController.afterPlaceOrderFail)


//contact

Router.get('/contact',contactController.getContact)

module.exports=Router;