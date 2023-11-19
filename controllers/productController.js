
const Products=require('../models/product')
const Categories=require('../models/category')
const SubCategories=require('../models/subCategory')
const Variants=require('../models/variants')
const fs = require('fs')
const sharp = require('sharp');
const { response } = require('express')


//get products
const getProducts = async (req, res,next) => {
try{
  const page = parseInt(req.query.page) || 1;
  const perPage = 7;
  const skip = (page - 1) * perPage;
  const totalProducts=await Products.find()
 const data= await Products.find()
  .populate('category')
  .populate('subCategory')
  .populate('variants').skip(skip).limit(perPage)
  
    let totalPages = Math.ceil( totalProducts.length / perPage);
    res.render('admin/products', { layout: './layout/admin-main', productList: data,totalPages,currentPage:page })
  

}catch(e){
next(e)
}

   
      

  }
  
  //to get add product page
  const getProductPage = async (req, res) => {
    const categoriesData = await Categories.find({ isValid: true })
    const categories = categoriesData.map((category) => category.name)
  
    const subCategoriesData = await SubCategories.find({ isValid: true })
    const subCategories = subCategoriesData.map((category) => category.name)
  
    await Products.find()
      .then((data) => {
        res.render('admin/addProduct', { layout: './layout/admin-main', productList: data, categories, subCategories })
      })
      .catch((err) => {
        console.log('error from category', err)
      })
  }


  
// to add variants to new product
const postProductAdd = async (req, res) => {
    try {
  
      const { name, price, categoryName, subCategoryName, description } = req.body
      const category = await Categories.findOne({ name: categoryName })
      const subCategory = await SubCategories.findOne({ name: subCategoryName })
      /*const images = req.files.map((file)=>({
          data:fs.readFileSync(path.join(__dirname+'../../public/uploads/'+file.filename)),
          contentType:file.mimetype
      }))*/
      const existingProduct = await Products.findOne({ name: { $regex: new RegExp(name, 'i') } });
      if (existingProduct) {
        const script = `
          <script>
            alert("Product with the name '${existingProduct.name}' already exists.");
            window.history.back();
          </script>
        `;

        res.status(400).send(script);
        return
    }
      const uploadedImages = req.files;
  
      const processedImageURLs = [];
  
      // Process each uploaded image
      for (const image of uploadedImages) {
        // Use sharp to crop and resize the image
        await sharp(image.path)
          .resize(600, 600) // Set the desired dimensions
          .toFile(`public/uploads/cropped_${image.filename}`); // Save the processed image
  
        // Add the processed image's URL to the response
        processedImageURLs.push(`/uploads/cropped_${image.filename}`);
      }
  
      const newProduct = new Products({ name, price,initialPrice:price, category, subCategory, images: processedImageURLs, description })
  
      await newProduct.save()
        .then((data) => {
  
          res.render('admin/addVariant', { layout: './layout/admin-main', product: data })
        })
        .catch((err) => {
          console.log(' error in save product', err)
        })
    }
    catch (e) {
      console.log('error in add product', e.message)
    }
  }
  //add variants and save product
  const addVariant = async (req, res) => {
  
    try {
      const { productId, color, sizes, quantities } = req.body
      const product = await Products.findOne({ _id: productId })
  
      let sizesWithQuantities, totalQuantity = 0;
  
      if (Array.isArray(sizes)) {
  
        sizesWithQuantities = sizes.map((size) => {
  
          const quantity = parseInt(quantities[size], 10);
          totalQuantity += quantity;
  
          return { size, quantity };
        });
      } else {
        let size = sizes
        const quantity = parseInt(quantities[size], 10);
        totalQuantity = quantity;
        sizesWithQuantities = { size, quantity }
      }
  
      const newVariant = new Variants({
        color: color,
        stock: totalQuantity,
        sizes: sizesWithQuantities,
        productId
      });
      const newVariantData = await newVariant.save()
      const variantId = newVariantData._id
  
      const variant = [...product.variants, variantId]
  
      product.variants = variant
  
      // // Calculate the total stock for the product and update the stock field
      // product.stock = await variant.reduce(async (total, variantId) => {
      //     const variant = await variantCollection.findById(variantId);
      //     return total + variant.quantity;
      //   }, 0);
      product.stock += totalQuantity
  
      try {
        await product.save()
      } catch (er) {
        console.log('error while add variant id : ', er.message)
      }
  
  
  
      res.render('admin/addVariant', { layout: './layout/admin-main', product })
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred while saving the form' });
    }
  }
  //get edit product
  const getEditProducts = async (req, res) => {
    const productId = req.params.id;
    try {
      const updatingData = await Products.findOne({ _id: productId });
      const categories = await Categories.find()
      const subCategories = await SubCategories.find()
  
  
      //console.log('updating data',updatingData.variants[0].sizes)
      res.render('admin/editProducts', { layout: './layout/admin-main', updatingData, categories, subCategories })
  
    } catch (error) {
      console.log(error.message)
    }
  }
  //post edit product
  const postEditProducts = async (req, res) => {
    try {
      console.log('inside edit pdt req.body', req.body)
      const productId = req.params.id
      const { name, price, categoryName, subCategoryName, isValid } = req.body
      const category = await Categories.findOne({ name: categoryName })
      const subCategory = await SubCategories.findOne({ name: subCategoryName })
      
    const pdtToUpdate=await Products.findById(productId)
    if(pdtToUpdate.name!==name){
      const existingProduct = await Products.findOne({ name: { $regex: new RegExp(name, 'i') } });
      if (existingProduct) {
        const script = `
          <script>
            alert("Product with the name '${existingProduct.name}' already exists.");
            window.history.back();
          </script>
        `;

        res.status(400).send(script);
        return
    }
}
  
      const uploadedImages = req.files;
      const processedImageURLs = []
      for (const image of uploadedImages) {
        // Use sharp to crop and resize the image
        await sharp(image.path)
          .resize(600, 600) // Set the desired dimensions
          .toFile(`public/uploads/cropped_${image.filename}`); // Save the processed image
  
        // Add the processed image's URL to the response
        processedImageURLs.push(`/uploads/cropped_${image.filename}`);
      }
  
      
      const product = await Products.findOne({ _id: productId })
  
      const images = [...product.images, ...processedImageURLs]
  
      const data = { name, price,initialPrice:price, images, isValid, category, subCategory }
  
      const productUpdated = await Products.updateOne(
        { _id: productId }, data
      );
  
  
      res.redirect('/admin/products')
      console.log('Updated product succesfully')
  
    } catch (er) {
      console.log('error in product update', er)
  
    }
  }
  
  //delete product
  const getdeleteProducts = async (req, res) => {
    const productId = req.params.id;
  
    await Products.updateOne({ _id: productId }, { isValid: 'false' })
      .then((data) => {
        res.redirect('/admin/products')
        console.log('done soft delete category')
      })
      .catch((err) => {
        console.log('error in soft delete category', err.message)
      })
  }
  //Search for product
  const getSearchProduct = async (req, res) => {
  
    const query = req.query.searchQuery;
    console.log("q", query);
  
    await Products.findOne({ name: { $regex: query, $options: "i" } })
      .then((data) => {
        console.log('serach category data to see', data
        )
        res.render('admin/products', { layout: './layout/admin-main', productList: data })
  
      })
      .catch((err) => {
        console.log('error for search category', err)
      })
  
  
  
  }
  //Delete image
  const deleteProductImage = async (req, res) => {
    const itemId = req.params.id
    const imageUrl = req.params.imageUrl
    const fullImageUrl = `/uploads/${imageUrl}`
    try {
      const product = await Products.findOne({ _id: itemId })
      const categories = await Categories.find()
      const subCategories = await SubCategories.find()
      const imageToDelete = product.images.find((img) => img === fullImageUrl)
      console.log(imageToDelete)
      product.images.pull(imageToDelete)
  
      await product.save()
  
      //remove from directory also
      fs.unlink(`./public${fullImageUrl}`, (err) => {
        if (err) {
          console.error('Error deleting image from file system:', err);
        } else {
          console.log('Image deleted from file system:', fullImageUrl);
        }
      });
  
      const updatingData = await Products.findOne({ _id: itemId });
      res.render('admin/editProducts', { layout: './layout/admin-main', updatingData, categories, subCategories })
  
    } catch (err) {
      console.log("error in deleting image", err.message)
    }
  }
  
  const addProductCheck=async(req,res,next)=>{
    try{
        const pdtId=req.params.id
        const product=await Products.findOne({_id:pdtId})
        console.log('from add pdt check',product)
        if(product.variants.length!==0){
           res.json(true)
        }else{
            res.json(false)
        }

    }catch(e){
        next(e)
    }
  }
  const addProductNameCheck=async(req,res,next)=>{
    
    try{
        console.log('check name pdt ')
        const pdtName=req.params.name
        const existingProduct = await Products.findOne({ name: { $regex: new RegExp(pdtName, 'i') } });
        console.log(existingProduct)

        if(existingProduct){
            res.json(true)
        }else{
            res.json(false)
        }
       

    }catch(e){
        next(e)
    }
  }
  module.exports={
    
  getProducts,
  postProductAdd,
  getEditProducts,
  postEditProducts,
  getSearchProduct,
  getdeleteProducts,
  deleteProductImage,
  getProductPage,
  addVariant,
  addProductCheck,
  addProductNameCheck
  }