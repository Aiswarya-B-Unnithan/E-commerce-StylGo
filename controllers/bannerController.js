const Banners = require("../models/banner")
const fs = require('fs')
const sharp = require('sharp');



//get categories
const getBanner = async (req, res, next) => {

    await Banners.find()
        .then((data) => {

            res.render('admin/banner', { layout: './layout/admin-main', bannerList: data })
        })
        .catch((err) => {
            console.log('error from category', err)
            next(err)
        })

}


const postBanner = async (req, res, next) => {
    try {
        let image = req.file
        let imageUrl = `/uploads/${image.filename}`

        const { primaryText, secondaryText } = req.body
        console.log('sec',secondaryText)

        const banner = new Banners({
            image: imageUrl,
            primaryText,
            secondaryText
        })
    await banner.save()
    res.redirect('/admin/banner')

    }

    catch (error) {
        next(error)
    }
}
//get edit Category
const getEditBanner = async (req, res, next) => {
    const bannerId = req.params.id;
    try {
        const updatingData = await Banners.findOne({ _id: bannerId });


        res.render('admin/editBanner', { layout: './layout/admin-main', updatingData })

    } catch (error) {
        next(error)
    }
}
//post edit category
const postEditBanner = async (req, res, next) => {

    let image = req.file
    const { primaryText, secondaryText } = req.body
    const bannerId = req.params.id
    let data
    if(image){
    let imageUrl = `/uploads/${image.filename}`
     data = { image:imageUrl,primaryText,secondaryText }
}else{
     data = { primaryText,secondaryText }
}

    
      


    try {
        await Banners.updateOne({ _id: bannerId }, data)
            .then((data) => {
                res.redirect('/admin/banner')
                console.log('Updated succesfully')
            })
    }
    catch (error) {
        next(error)
    }
}
//delete
const getdeleteBanner = async (req, res, next) => {
    const bannerId = req.params.id;
    try {
        await Banners.findByIdAndDelete(bannerId)

    } catch (error) {
        next(error)
    }

}



module.exports = {
    getBanner,
    getEditBanner,
    getdeleteBanner,
    postBanner,
    postEditBanner
}