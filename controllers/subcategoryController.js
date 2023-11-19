const SubCategories=require('../models/subCategory')
const fs = require('fs')
const sharp = require('sharp');

//get categories
const getSubCategories = async (req, res) => {

    await SubCategories.find()
      .then((data) => {
        res.render('admin/subCategories', { layout: './layout/admin-main', categoryList: data })
      })
      .catch((err) => {
        console.log('error from category', err)
      })
  
  }
  
const postSubCategory = async (req, res) => {
    try {
  
      const { name, description } = req.body
      const uploadedImages = req.files;
      const processedImageURLs = [];
  
      const existingSubCategory = await SubCategories.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
      if (existingSubCategory) {
        const script = `
              <script>
                alert("Sub-category with the name '${existingSubCategory.name}' already exists.");
                window.history.back();
              </script>
            `;
  
        res.status(400).send(script);
        return
      } else {
  
        // Process each uploaded image
        for (const image of uploadedImages) {
          // Use sharp to crop and resize the image
          await sharp(image.path)
            .resize(200, 200) // Set the desired dimensions
            .toFile(`public/uploads/cropped_${image.filename}`); // Save the processed image
  
          // Add the processed image's URL to the response
          processedImageURLs.push(`/uploads/cropped_${image.filename}`);
        }
  
  
        const newCategoey = new SubCategories({ name, description, images: processedImageURLs })
        await newCategoey.save()
  
  
        res.redirect('/admin/subCategories')
      }
    } catch (error) {
  
      console.log('error in add sub-category', error)
      if (error.code === 11000 && error.keyPattern && error.keyValue && error.keyPattern.name === 1) {
        const duplicateName = error.keyValue.name;
        // Send a JavaScript script to display an alert and navigate back
        const script = `
            <script>
              alert("Sub-category with the name '${duplicateName}' already exists.");
              window.history.back();
            </script>
          `;
  
        res.status(400).send(script);
      } else {
        console.error('Error while adding sub-category:', error);
        // Handle other errors and send an appropriate response
        res.status(500).send('An error occurred while adding the sub-category.');
      }
    }
  }
  //get edit sub-Category
  const getEditSubCategory = async (req, res) => {
    const categoryId = req.params.id;
    try {
      const updatingData = await SubCategories.findOne({ _id: categoryId });
  
  
      res.render('admin/editSubCategories', { layout: './layout/admin-main', updatingData })
  
    } catch (error) {
      console.log(error.message)
    }
  }
  //post edit sub-category
  const postEditSubCategory = async (req, res) => {
  
  
    const { name, description, isValid } = req.body
    const uploadedImages = req.files;
    const processedImageURLs = []
    const categoryId = req.params.id
    const categoryToUpdate=await SubCategories.findById(categoryId)
    if(categoryToUpdate.name!==name){
        const existingCategory = await SubCategories.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingCategory) {
        const script = `
          <script>
            alert("Sub-category with the name '${existingCategory.name}' already exists.");
            window.history.back();
          </script>
        `;

        res.status(400).send(script);
        return
    }
  }
    for (const image of uploadedImages) {
      // Use sharp to crop and resize the image
      await sharp(image.path)
        .resize(400, 400) // Set the desired dimensions
        .toFile(`public/uploads/cropped_${image.filename}`); // Save the processed image
  
      // Add the processed image's URL to the response
      processedImageURLs.push(`/uploads/cropped_${image.filename}`);
    }
  
    
    const category = await SubCategories.findOne({ _id: categoryId })
    const images = [...category.images, ...processedImageURLs]
    const data = { name, description, images, isValid }
  
  
    try {
      await SubCategories.updateOne({ _id: categoryId }, data)
        .then((data) => {
          res.redirect('/admin/subCategories')
          console.log('Updated succesfully')
        })
    }
    catch (er) {
      console.log('error in category uodatinh', er.message)
  
    }
  }
  //delete
  const getdeleteSubCategory = async (req, res) => {
    console.log('entered in delete sub')
    const categorytId = req.params.id;
    try {
      await SubCategories.updateOne({ _id: categorytId }, { isValid: 'false' })
      //delete the product with same sub category
      const products = await Products.find({ subCategory: categorytId })
      products.forEach(async (product) => {
        product.isValid = false
        await product.save()
      })
  
  
      res.redirect('/admin/subCategories')
      console.log('done soft delete category')
    } catch (err) {
      console.log('error in soft delete category', err.message)
    }
  }
  
  //Search for sub-category
  const getSearchSubCategory = async (req, res) => {
  
    const query = req.query.searchQuery;
    console.log("q", query);
  
    await SubCategories.findOne({ name: { $regex: query, $options: "i" } })
      .then((data) => {
        console.log('serach category data to see', data
        )
        res.render('admin/subCategories', { layout: './layout/admin-main', categoryList: data })
  
      })
      .catch((err) => {
        console.log('error for search sub category', err)
      })
  
  
  
  }
  
  //Delete image
  const deleteSubCategoryImage = async (req, res) => {
  
    const itemId = req.params.id
    const imageUrl = req.params.imageUrl
    const fullImageUrl = `/uploads/${imageUrl}`
    console.log('img url ', imageUrl)
    try {
      const category = await SubCategories.findOne({ _id: itemId })
  
      const imageToDelete = category.images.find((img) => img === fullImageUrl)
  
      category.images.pull(imageToDelete)
  
      await category.save()
      //remove from directory also
      fs.unlink(`./public${fullImageUrl}`, (err) => {
        if (err) {
          console.error('Error deleting image from file system:', err);
        } else {
          console.log('Image deleted from file system:', fullImageUrl);
        }
      });
  
      const updatingData = await SubCategories.findOne({ _id: itemId });
      res.render('admin/editSubCategories', { layout: './layout/admin-main', updatingData })
  
    } catch (err) {
      console.log("error in deleting image", err.message)
    }
  }
  
  module.exports={
    getSubCategories,
  postSubCategory,
  getEditSubCategory,
  postEditSubCategory,
  getdeleteSubCategory,
  getSearchSubCategory,
  deleteSubCategoryImage,
  }