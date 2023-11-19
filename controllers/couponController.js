const Coupon=require('../models/coupon')
const Categories=require('../models/category')
const SubCategories=require('../models/subCategory')
const Products=require('../models/product')


const getCoupons = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
        const perPage = 7;
        const skip = (page - 1) * perPage;

        const totalCouponList = await Coupon.find()
        const couponList = await Coupon.find().skip(skip).limit(perPage)

        let totalPages = Math.ceil( totalCouponList.length / perPage);
        
        res.render('admin/coupon', { layout: './layout/admin-main', couponList,totalPages,currentPage:page })
  
    } catch (e) {
        next(e)
    }
  
  }
  
  const getCouponForData=async(req,res,next)=>{
    console.log('enter for coupon for data')
      const couponFor = req.query.couponFor;

    try {
        // Fetch data based on the selected couponFor value
        let data;
        if (couponFor === 'category') {
            // Fetch category data
            data = await Categories.find({isValid:true});
        } else if (couponFor === 'subCategory') {
            // Fetch sub-category data
            data = await SubCategories.find({isValid:true})
        } else if (couponFor === 'product') {
            // Fetch product data
            data = await Products.find({isValid:true})
        }

        res.json(data);
    }catch(e){
      next(e)
    }
  }
  
  const postCoupon = async (req, res, next) => {
    try {
  
        const { couponName, couponCode,discountType,couponFor,couponForName,description, discountValue, startDate, endDate, minPurchaseAmt } = req.body
       
  
        const existingCoupon = await Coupon.findOne({
          $or: [
            { couponCode: { $regex: new RegExp(`^${couponCode}$`, 'i') } },
            { couponName: { $regex: new RegExp(`^${couponName}$`, 'i') } }
          ]
        });
        
        if (existingCoupon) {
            const script = `
              <script>
                alert("Coupon with the code '${existingCoupon.couponCode}' already exists.");
                window.history.back();
              </script>
            `;
  
            res.status(400).send(script);
        }
        else {
  
  
            const newCoupon = new Coupon({ couponName, couponCode,discountValue,discountType,couponFor,couponForName,description, minPurchaseAmt, startDate, endDate })
            await newCoupon.save()
  
            res.redirect('/admin/coupon')
        }
    }
  
    catch (error) {
       next(error)
    }
  }
  //get edit Coupon
  const getEditCoupon = async (req, res) => {
    const couponId = req.params.id;
    try {
        const updatingData = await Coupon.findOne({ _id: couponId });
  
  
        res.render('admin/editCoupon', { layout: './layout/admin-main', updatingData })
  
    } catch (error) {
        console.log(error.message)
    }
  }
  //post edit coupon
  const postEditCoupon = async (req, res,next) => {
    try {
      const { couponName, couponCode,discountType,couponFor,couponForName,description, discountValue, startDate, endDate, minPurchaseAmt } = req.body
        const couponId = req.params.id
        const data ={ couponName, couponCode,discountValue,discountType,couponFor,couponForName,description, minPurchaseAmt, startDate, endDate }
  
        await Coupon.updateOne({ _id: couponId }, data)
        res.redirect('/admin/coupon')
    }
    catch (er) {
       next(er)
  
    }
  }
  //delete
  const getdeleteCoupon = async (req, res) => {
    const coupontId = req.params.id;
    try {
        const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
        await Coupon.updateOne({ _id: coupontId }, { endDate: yesterday })
        res.redirect('/admin/coupon')
  
    } catch (err) {
        console.log('error in soft delete category', err.message)
    }
  
  
  }
  
  
  //Search for coupon
  const getSearchCoupon = async (req, res, next) => {
    try {
        const query = req.query.searchQuery;
        let couponList
        if(query===false){
            couponList=await Coupon.find()
        }else{
        couponList = await Coupon.find({
          $or: [
            { couponCode: { $regex: new RegExp(`^${query}$`, 'i') } },
            { couponName: { $regex: new RegExp(`^${query}$`, 'i') } }
          ]
        });
    }
        
        res.render('admin/coupon', { layout: './layout/admin-main', couponList })
    } catch (e) {
        next(e)
    }
  
  
  }
  
  
  module.exports={
    getCoupons,
    getCouponForData,
  postCoupon,
  getEditCoupon,
  postEditCoupon,
  getdeleteCoupon,getSearchCoupon,
  }