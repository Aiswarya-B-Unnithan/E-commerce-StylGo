const Products = require('../models/product')
const Categories = require('../models/category')
const Banners=require('../models/banner')



//get Home
const getHome = async (req, res, next) => {
    try {
        const products = await Products.find()
        const categories = await Categories.find({ isValid: true })
        const banners=await Banners.find()
        res.render('user/home', { layout: false, products, categories,banners })
    } catch (e) {
        next(e)
    }

}
/*
const applyOffer = async (pdtId) => {
    try {
        const pdt = await Products.findOne({ _id: pdtId })
        const offers = await Offers.find({ isValid: true })
        let offerAmt = 0
        offers.forEach(ofr => {
            if (ofr.offerFor === 'product') {
                if (pdt.name === ofr.offerForName) {
                    offerAmt = Math.max(offerAmt, ofr.discountPercentage)
                }
            } else if (ofr.offerFor === 'category') {
                if (pdt.category.name === ofr.offerForName) {
                    offerAmt = Math.max(offerAmt, ofr.discountPercentage)
                }

            } else if (ofr.offerFor === 'subCategory') {
                if (pdt.subCategory.name === ofr.offerForName) {
                    offerAmt = Math.max(offerAmt, ofr.discountPercentage)
                }

            }
        })

        pdt.offerValue = offerAmt.toFixed(2)
        pdt.price=pdt.price-((pdt.price*offerAmt)/100)
        await pdt.save()
        console.log('from save fn', pdt)
        return pdt
    } catch (e) {
        console.log(e)
    }
}*/

const getShop = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = 6;
        const skip = (page - 1) * perPage;

        let products = await Products.find({ isValid: true })
            .skip(skip)
            .limit(perPage);

       /* products = await Promise.all(products.map(async (pdt) => {
            return await applyOffer(pdt);
        }));*/

        const categories = await Categories.find({ isValid: true });
        const totalProducts = await Products.countDocuments({});
        const totalValidProducts = await Products.countDocuments({ isValid: true });
        const totalPages = Math.ceil(totalValidProducts / perPage);

        res.render('user/shop', {
            layout: './layout/user-main',
            products,
            categories,
            additionalData: categories,
            totalPages,
            totalProducts,
            currentPage: page,

        });
    } catch (e) {
        console.log('Error in get shop page: ', e.message);
    }
};
const getSearchProduct = async (req, res, next) => {
    try {

        const searchQuery = req.query.searchQuery;
        let products = await Products.find({
            isValid: true,
            name: { $regex: searchQuery, $options: 'i' }
        })

        if (products.length === 0) {
            const totalPdts = await Products.find({ isValid: true }).lean()
            // products=totalPdts.filter(pdt=>pdt.category.name===searchQuery || pdt.subCategory.name===searchQuery)
            totalPdts.forEach((pdt) => {
                if (pdt.category.name.toLowerCase() === searchQuery.toLowerCase()) {
                    products.push(pdt)
                }else if (pdt.subCategory.name.toLowerCase() === searchQuery.toLowerCase()) {
                    products.push(pdt)
                }
            })
        }
        
        // Do something with the found products
        const categories = await Categories.find({ isValid: true });
        const totalProducts = products.length


        res.render('user/shopFilter', {
            layout: './layout/user-main',
            products,
            categories,
            additionalData: categories,

            totalProducts,


        });


    }
    catch (e) {
        next(e)
    }


}
//==================Filter==============
const getShopFilter = async (req, res, next) => {
    try {

        console.log('shop filter page', req.body)

        // Filter parameters (you can add more as needed)
        const priceFilter = req.body.price; // For price range filtering
        let lowerPrice
        let upperPrice

        if (priceFilter !== 'undefined') {
            let prices = priceFilter.split('-')
            lowerPrice = prices[0]
            upperPrice = prices[1]
        }

        const colorFilter = req.body.color; // For color filtering
        const sizeFilter = req.body.size; // For size filtering

        /* // Define the filter object based on the query parameters
         const filter = { isValid: true };
 
         if (priceFilter) {
             // Adjust this based on your actual price filter structure
             // For example, if price filter is an array of selected price ranges
             filter.price = { $in: priceFilter };
         }
 
         if (colorFilter) {
             filter.color = colorFilter;
         }
 
         if (sizeFilter) {
             filter.size = sizeFilter;
         }
 
         // Query products with the applied filters
         const products = await Products.find(filter)
             .skip(skip)
             .limit(perPage);
             const filterCriteria = {
                 'variants': {
                   $elemMatch: {
                     color: 'black', // Color you want to filter
                     // Add more criteria here as needed
                   }
                 }
               }; */
        let products
        let filteredProducts = []
        //if have price filter direct aplly and find
        if (priceFilter !== 'undefined') {
            products = await Products.find({ isValid: true, price: { $gt: lowerPrice, $lt: upperPrice } })
            console.log(products)
            //if have only price fiklter
            if (colorFilter === 'undefined' && sizeFilter === 'undefined') {
                filteredProducts = products

            } else if (colorFilter !== 'undefined' && sizeFilter !== 'undefined') {
                products.forEach((product, index) => {
                    product.variants.forEach(variant => {
                        if (variant.color === colorFilter) {
                            variant.sizes.forEach(sizeObj => {
                                if (sizeObj.size === sizeFilter)
                                    filteredProducts.push(product)
                            })
                        }
                    })
                })

            }
            else if (colorFilter !== 'undefined') {
                products.forEach((product, index) => {
                    product.variants.forEach(variant => {
                        if (variant.color === colorFilter) {
                            filteredProducts.push(product)
                        }
                    })
                })
            }
            else if (sizeFilter !== 'undefined') {
                products.forEach((product, index) => {
                    product.variants.forEach(variant => {
                        variant.sizes.forEach(sizeObj => {
                            if (sizeObj.size === sizeFilter)
                                filteredProducts.push(product)
                        })
                    })
                })

            }
        } else {
            console.log('else price filter')
            products = await Products.find({ isValid: true })



            if (colorFilter === 'undefined' && sizeFilter === 'undefined') {
                filteredProducts = products

            } else if (colorFilter !== 'undefined' && sizeFilter !== 'undefined') {
                console.log('both ')
                products.forEach((product, index) => {
                    product.variants.forEach(variant => {
                        if (variant.color === colorFilter) {
                            variant.sizes.forEach(sizeObj => {
                                if (sizeObj.size === sizeFilter)
                                    filteredProducts.push(product)
                            })
                        }
                    })
                })


            }
            else if (colorFilter !== 'undefined') {
                products.forEach((product, index) => {
                    product.variants.forEach(variant => {
                        if (variant.color === colorFilter) {
                            filteredProducts.push(product)
                        }
                    })
                })
            }
            else if (sizeFilter !== 'undefined') {
                products.forEach((product, index) => {
                    product.variants.forEach(variant => {
                        variant.sizes.forEach(sizeObj => {
                            if (sizeObj.size === sizeFilter)
                                filteredProducts.push(product)
                        })
                    })
                })

            }
        }


        let uniqueFilterdProductsSet = new Set(filteredProducts)
        let uniqueFilteredProducts = [...uniqueFilterdProductsSet]
        let totalProducts = uniqueFilteredProducts.length
       

        const categories = await Categories.find({ isValid: true });

        res.render('user/shopFilter', {
            layout: './layout/user-main',
            products: uniqueFilteredProducts,
            categories,
            additionalData: categories,
            totalProducts,


        });
    } catch (e) {
        //console.log('Error in get shop page: ', e.message);
        next(e)
    }
};

//====================== product detail=================
const getProductDetail = async (req, res, next) => {
    try {
        const productId = req.params.id
        let product = await Products.findOne({ _id: productId })
            .populate('category')
            .populate('subCategory')
            .populate('variants')
       
        const categories = await Categories.find({ isValid: true })
        const additionalData = categories//to set in headers , the categories

        res.render('user/shop-detail', { layout: './layout/user-main', product, additionalData })

    } catch (e) {
        console.log('ERROR in shop detail page', e)
        next(e)
    }

}


module.exports = {
    getHome,
    getShop,
    getSearchProduct,
    getShopFilter,
    getProductDetail,

}
