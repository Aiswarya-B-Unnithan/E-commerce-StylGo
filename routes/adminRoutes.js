const express=require('express')
const  Router=express.Router()
const middlewares=require('../middlewares/admin/auth')
const adminController=require('../controllers/adminController')
const categoryController=require('../controllers/categoryController')
const upload=require('../config/multer')
const subcategoryController=require('../controllers/subcategoryController')
const productController=require('../controllers/productController')
const couponController=require('../controllers/couponController')
const userController=require('../controllers/userController')
const orderController=require('../controllers/orderController')
const salesReportController=require('../controllers/salesReportController')
const offerController=require('../controllers/offerController')
const bannerController=require("../controllers/bannerController")

Router.get('/',adminController.getLogin)
Router.get('/',adminController.getLogin)
Router.post('/',adminController.postLogin)
Router.post('/otp',adminController.postOtp)
Router.post('/resend',adminController.postResend)
Router.get('/dashboard',middlewares.isAdminAuthenticated,adminController.getDashboard) //----- hides just for style fixing

Router.post('/logout',adminController.postLogout)

//user
Router.get('/users',middlewares.isAdminAuthenticated,userController.getUsers) // ----- hides just for style fixing
//Router.get('/users',adminController.getUsers)
Router.get('/searchUser',userController.getSearchUser)
Router.get('/blockUnblockUser/:id',userController.getBlockUnblockUser)

//Category
Router.get('/categories',middlewares.isAdminAuthenticated,categoryController.getCategories)
Router.post('/categories',upload.array('images',5),categoryController.postCategory)
Router.get('/editCategory/:id',categoryController.getEditCategory)
Router.post('/editCategory/:id',upload.array('images',5),categoryController.postEditCategory)
Router.get('/deleteCategory/:id',categoryController.getdeleteCategory)
Router.get('/searchCategory',categoryController.getSearchCategory)
Router.get('/deleteImgCategory/:id/:imageUrl',categoryController.deleteCategoryImage)
Router.get('/add-category-nameCheck/:name',categoryController.addCategoryNameCheck)


//SubCategory
Router.get('/subCategories',middlewares.isAdminAuthenticated,subcategoryController.getSubCategories)
Router.post('/subCategories',upload.array('images',5),subcategoryController.postSubCategory)
Router.get('/editSubCategory/:id',subcategoryController.getEditSubCategory)
Router.post('/editSubCategory/:id',upload.array('images',5),subcategoryController.postEditSubCategory)
Router.get('/deleteSubCategory/:id',subcategoryController.getdeleteSubCategory)
Router.get('/searchSubCategory',subcategoryController.getSearchSubCategory)
Router.get('/deleteImgSubCategory/:id/:imageUrl',subcategoryController.deleteSubCategoryImage)


//products
Router.get('/products',middlewares.isAdminAuthenticated,productController.getProducts)
//Router.post('/products',upload.array('images',5),adminController.postProduct)
Router.get('/editProducts/:id',productController.getEditProducts)
Router.post('/editProduct/:id',upload.array('images',5),productController.postEditProducts)
Router.get('/deleteProduct/:id',productController.getdeleteProducts)
Router.get('/searchProducts',productController.getSearchProduct)
Router.get('/deletePdtImage/:id/:imageUrl',productController.deleteProductImage)
Router.get('/Product/add',productController.getProductPage)
Router.post('/Product/add',upload.array('images',5),productController.postProductAdd)
Router.post('/Product/add/variant',productController.addVariant)
Router.get('/add-product/:id',productController.addProductCheck)
Router.get('/add-product-nameCheck/:name',productController.addProductNameCheck)


//Coupons
Router.get('/coupon',middlewares.isAdminAuthenticated,couponController.getCoupons)
Router.get('/getCouponForData',couponController.getCouponForData)
Router.post('/coupon',couponController.postCoupon)
Router.get('/editCoupon/:id',couponController.getEditCoupon)
Router.post('/editCoupon/:id',couponController.postEditCoupon)
Router.get('/deleteCoupon/:id',couponController.getdeleteCoupon)
Router.get('/searchCoupon',couponController.getSearchCoupon)


//Offers
Router.get('/offer',middlewares.isAdminAuthenticated,offerController.getOffers)
Router.get('/getOfferForData',offerController.getOfferForData)
Router.post('/offer',offerController.postOffer)
Router.get('/editOffer/:id',offerController.getEditOffer)
Router.post('/editOffer/:id',offerController.postEditOffer)
Router.get('/deleteOffer/:id',offerController.getdeleteOffer)
Router.get('/searchOffer',offerController.getSearchOffer)


//orders
Router.get('/orders',middlewares.isAdminAuthenticated,orderController.getOrders)
Router.get('/searchOrders',orderController.getSearchOrder)
Router.post('/orders/changeStatus/:orderId',orderController.editOrderStatus)


//sales report
Router.get("/sales-report",middlewares.isAdminAuthenticated, salesReportController.getSalesReportData);
Router.get("/salesReport",middlewares.isAdminAuthenticated, salesReportController.getSalesReport);
Router.post("/salesReport", salesReportController.getSalesReportData);
Router.get("/salesReport/lineGraph",middlewares.isAdminAuthenticated, salesReportController.getSalesReportForLineGraph);

//banner

Router.get('/banner',middlewares.isAdminAuthenticated,bannerController.getBanner)
Router.post('/banner',upload.single('image'),bannerController.postBanner)
Router.get('/editBanner/:id',bannerController.getEditBanner)
Router.post('/editBanner/:id',upload.single('image'),bannerController.postEditBanner)
Router.get('/deleteBanner/:id',bannerController.getdeleteBanner)


module.exports=Router