
const Categories=require('../models/category')

const getContact=async(req,res,next)=>{
    try{
        const categories = await Categories.find({ isValid: true })

        const additionalData = categories
res.render('user/contact',{layout: './layout/user-main',additionalData})
    }
    catch(e){
        next(e)
    }
}

module.exports={
    getContact
}