const Coupon=require('../models/coupon')
const Categories=require('../models/category')
const SubCategories=require('../models/subCategory')
const Products=require('../models/product')
const Offers=require('../models/offer')


const getOffers = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
        const perPage = 7;
        const skip = (page - 1) * perPage;

        const totalCouponList = await Offers.find()
        const offerList = await Offers.find().skip(skip).limit(perPage)

        let totalPages = Math.ceil( totalCouponList.length / perPage);
        
        res.render('admin/offer', { layout: './layout/admin-main', offerList,totalPages,currentPage:page })
  
    } catch (e) {
        next(e)
    }
  
  }
  
  const getOfferForData=async(req,res,next)=>{
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
  
  const postOffer = async (req, res, next) => {
    try {
  
        const { offerName,discountPercentage,offerFor,offerForName } = req.body
        let products=await Products.find({isValid:true})
        const existingCoupon = await Offers.findOne({
          
            offerName: { $regex: new RegExp(`^${offerName}$`, 'i') } }
        );
        
        if (existingCoupon) {
            const script = `
              <script>
                alert("Coupon with the code '${existingCoupon.offerName}' already exists.");
                window.history.back();
              </script>
            `;
  
            res.status(400).send(script);
        }
        else {
  
  
            const newOffer = new Offers({ offerName,discountPercentage,offerFor,offerForName })
            await newOffer.save()

            //apply offer to products
            products=products.forEach(async pdt=>{
              if(offerFor==='product'){
               if(pdt.name===offerForName){
                if(!(pdt.offer)||pdt.offer.discountPercentage<discountPercentage){// apply max offer
                  pdt.offer=newOffer._id
                  pdt.offerAmt=(pdt.price*discountPercentage)/100
                  pdt.price=(pdt.price-((pdt.price*discountPercentage)/100)).toFixed(2)
                }
               }
              }else if(offerFor==='category'){
                if(pdt.category.name===offerForName){
                  if(!(pdt.offer)||pdt.offer.discountPercentage<discountPercentage){// apply max offer
                    pdt.offer=newOffer._id
                    pdt.offerAmt=(pdt.price*discountPercentage)/100
                    pdt.price=(pdt.price-((pdt.price*discountPercentage)/100)).toFixed(2)
                  }
                 }
  
              }else if(offerFor==='subCategory'){
                if(pdt.subCategory.name===offerForName){
                  if(pdt.offer.discountPercentage<discountPercentage){// apply max offer
                    pdt.offer=newOffer._id
                    pdt.offerAmt=(pdt.price*discountPercentage)/100
                    pdt.price=(pdt.price-((pdt.price*discountPercentage)/100)).toFixed(2)
                  }
                 }
              }
              await pdt.save()
            })
            
  
            res.redirect('/admin/offer')
        }
    }
  
    catch (error) {
       next(error)
    }
  }
  //get edit Coupon
  const getEditOffer = async (req, res) => {
    const couponId = req.params.id;
    try {
        const updatingData = await Offers.findOne({ _id: couponId });
  
  
        res.render('admin/editOffer', { layout: './layout/admin-main', updatingData })
  
    } catch (error) {
        console.log(error.message)
    }
  }
  //post edit coupon
  const postEditOffer = async (req, res,next) => {
    try {
        const { offerName,discountPercentage,offerFor,offerForName,isValid } = req.body
        const offerId = req.params.id
        const data ={ offerName,discountPercentage,offerFor,offerForName,isValid }
        const offer=await Offers.find({_id:offerId})
        if(offer.discountPercentage!==discountPercentage){//if offer price change,change in products
          let products=await Products.find({isValid:true})
          //apply offer to products
          products.forEach(async pdt=>{
            if(offerFor==='product'){
             if(pdt.name===offerForName){
              if(!(pdt.offer)||pdt.offer.discountPercentage<discountPercentage){// apply max offer
                pdt.offer=offerId
                pdt.offerAmt=(pdt.price*discountPercentage)/100
                pdt.price=(pdt.price-((pdt.price*discountPercentage)/100)).toFixed(2)
              }
             }
            }else if(offerFor==='category'){
              if(pdt.category.name===offerForName){
                if(!(pdt.offer)||pdt.offer.discountPercentage<discountPercentage){// apply max offer
                  pdt.offer=offerId
                  pdt.offerAmt=(pdt.price*discountPercentage)/100
                  pdt.price=(pdt.price-((pdt.price*discountPercentage)/100)).toFixed(2)
                }
               }

            }else if(offerFor==='subCategory'){
              if(pdt.subCategory.name===offerForName){
                if(!(pdt.offer)||pdt.offer.discountPercentage<discountPercentage){// apply max offer
                  pdt.offer=offerId
                  pdt.offerAmt=(pdt.price*discountPercentage)/100
                  pdt.price=(pdt.price-((pdt.price*discountPercentage)/100)).toFixed(2)
                }
               }
            }
            await pdt.save()
          })

        }
  
        await Offers.updateOne({ _id: offerId }, data)
        res.redirect('/admin/offer')
    }
    catch (er) {
       next(er)
  
    }
  }
  //delete
  const getdeleteOffer = async (req, res) => {
    const offerId = req.params.id;
    try {
      //delete offer from products
      
        const offer=await Offers.findById(offerId)
        await Offers.findByIdAndDelete(offerId)
        
        
        // Remove the offer reference from products
       /* await Products.updateMany({ offer: offerId }, { $unset: { offer: {},$set:{price:$add:{price:offerAmt}}} });
        const offerId = // your offerId */

await Products.updateMany(
  { offer: offerId },
  [
    {
      $unset: "offer"
    },
    {
      $set: {
        price: 
            "$initialPrice"
        
      }
    }
  ]
);

      
        //check for another offer and apply
        const offers=await Offers.find()
        let products=await Products.find({isValid:true})
       offers.forEach(ofr=>{
        let offerId=ofr._id
        //search each offer for all products
        products.forEach(async pdt=>{
          if(ofr.offerFor==='product'){
           if(pdt.name===ofr.offerForName){
            if(!(pdt.offer)){// apply max offer
              pdt.offer=offerId
              pdt.price=(pdt.price-((pdt.price*ofr.discountPercentage)/100)).toFixed(2)
              await pdt.save()
            }
            if(pdt.offer.discountPercentage<ofr.discountPercentage){
              pdt.offer=offerId
              pdt.price=(pdt.price-((pdt.price*ofr.discountPercentage)/100)).toFixed(2)
              await pdt.save()
            }
           }
          }else if(ofr.offerFor==='category'){
            if(pdt.category.name===ofr.offerForName){
              if(!(pdt.offer)||pdt.offer.discountPercentage<ofr.discountPercentage){// apply max offer
                pdt.offer=offerId
                pdt.price=(pdt.price-((pdt.price*ofr.discountPercentage)/100)).toFixed(2)
                await pdt.save()
              }
             }

          }else if(ofr.offerFor==='subCategory'){
            if(pdt.subCategory.name===ofr.offerForName){
              if(!(pdt.offer)||pdt.offer.discountPercentage<ofr.discountPercentage){// apply max offer
                pdt.offer=offerId
                pdt.price=(pdt.price-((pdt.price*ofr.discountPercentage)/100)).toFixed(2)
                await pdt.save()
              }
             }
          }
          
        })

        })



        res.redirect('/admin/offer')
  
    } catch (err) {
        console.log('error in  delete offer', err.message)
    }
  
  
  }
  
  
  //Search for coupon
  const getSearchOffer = async (req, res, next) => {
    try {
        const query = req.query.searchQuery;
        let offerList
        if(query===false){
            offerList=await Offers.find()
        }else{
        offerList = await Offers.find({ offerName: { $regex: new RegExp(`^${query}$`, 'i') } }
          );
    }
        
        res.render('admin/offer', { layout: './layout/admin-main', offerList })
    } catch (e) {
        next(e)
    }
  
  
  }
  
  
  module.exports={
    getOffers,
    getOfferForData,
  postOffer,
  getEditOffer,
  postEditOffer,
  getdeleteOffer,getSearchOffer,
  }