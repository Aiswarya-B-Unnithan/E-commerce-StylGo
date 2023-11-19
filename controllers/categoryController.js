const Categories = require('../models/category')
const fs = require('fs')
const sharp = require('sharp');



//get categories
const getCategories = async (req, res, next) => {

    await Categories.find()
        .then((data) => {

            res.render('admin/category', { layout: './layout/admin-main', categoryList: data })
        })
        .catch((err) => {
            console.log('error from category', err)
            next(err)
        })

}


const postCategory = async (req, res, next) => {
    try {

        const { name, description } = req.body
        const uploadedImages = req.files;
        const processedImageURLs = [];

        const existingCategory = await Categories.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
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
        else {
            // Process each uploaded image
            for (const image of uploadedImages) {
                // Use sharp to crop and resize the image
                await sharp(image.path)
                    .resize(400, 400) // Set the desired dimensions
                    .toFile(`public/uploads/cropped_${image.filename}`); // Save the processed image

                // Add the processed image's URL to the response
                processedImageURLs.push(`/uploads/cropped_${image.filename}`);
            }


            // const images=req.files.map((file)=>file.path) =============  because have to save with forward slash instead of backslash so next code 
            //const images=req.files.map((file)=>`/uploads/${file.filename}`) =============== code before cropping
            /*============== code before change to save using name
            // const images = req.files.map((file)=>({
            //         data:fs.readFileSync(path.join(__dirname+'../../public/uploads/'+file.filename)),
            //         contentType:file.mimetype
            //       }))*/


            const newCategoey = new Categories({ name, description, images: processedImageURLs })
            await newCategoey.save()

            res.redirect('/admin/categories')
        }
    }

    catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyValue && error.keyPattern.name === 1) {
            const duplicateName = error.keyValue.name;
            // Send a JavaScript script to display an alert and navigate back
            const script = `
            <script>
              alert("Category with the name '${duplicateName}' already exists.");
              window.history.back();
            </script>
          `;

            res.status(400).send(script);
        } else {
            console.error('Error while adding Category:', error);
            // Handle other errors and send an appropriate response
            res.status(500).send('An error occurred while adding the Category.');
            next(error)
        }
    }
}
//get edit Category
const getEditCategory = async (req, res, next) => {
    const categoryId = req.params.id;
    try {
        const updatingData = await Categories.findOne({ _id: categoryId });


        res.render('admin/editCategories', { layout: './layout/admin-main', updatingData })

    } catch (error) {
        next(error)
    }
}
//post edit category
const postEditCategory = async (req, res, next) => {


    const { name, description, isValid } = req.body
    const categoryId = req.params.id
    const categoryToUpdate=await Categories.findById(categoryId)
    if(categoryToUpdate.name!==name){
        const existingCategory = await Categories.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingCategory) {
        const script = `
          <script>
            alert("Category with the name '${existingCategory.name}' already exists.");
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
            .resize(400, 400) // Set the desired dimensions
            .toFile(`public/uploads/cropped_${image.filename}`); // Save the processed image

        // Add the processed image's URL to the response
        processedImageURLs.push(`/uploads/cropped_${image.filename}`);
    }
    const category = await Categories.findOne({ _id: categoryId })
    const images = [...category.images, ...processedImageURLs]
    const data = { name, description, images, isValid }


    try {
        await Categories.updateOne({ _id: categoryId }, data)
            .then((data) => {
                res.redirect('/admin/categories')
                console.log('Updated succesfully')
            })
    }
    catch (error) {
        next(error)
    }
}
//delete
const getdeleteCategory = async (req, res, next) => {
    const categorytId = req.params.id;
    try {
        await Categories.updateOne({ _id: categorytId }, { isValid: 'false' })
        res.redirect('/admin/categories')
        console.log('done soft delete category')
        //delete the product with same sub category
        const products = await Products.find({ category: categorytId })
        products.forEach(async (product) => {
            product.isValid = false
            await product.save()
        })

    } catch (error) {
        next(error)
    }

}


//Search for category
const getSearchCategory = async (req, res, next) => {

    const query = req.query.searchQuery;
    console.log("q", query);

    await Categories.findOne({ name: { $regex: query, $options: "i" } })
        .then((data) => {

            res.render('admin/category', { layout: './layout/admin-main', categoryList: data })

        })
        .catch((err) => {
            next(err)
        })



}

//Delete image
const deleteCategoryImage = async (req, res, next) => {
    const itemId = req.params.id
    const imageUrl = req.params.imageUrl
    const fullImageUrl = `/uploads/${imageUrl}`
    try {
        const category = await Categories.findOne({ _id: itemId })
        const imageToDelete = category.images.find((img) => img === fullImageUrl)
        console.log(imageToDelete)
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

        const updatingData = await Categories.findOne({ _id: itemId });
        res.render('admin/editCategories', { layout: './layout/admin-main', updatingData })

    } catch (error) {
        next(error)
    }
}
const addCategoryNameCheck=async(req,res,next)=>{
    
    try{
        console.log('check name pdt ')
        const pdtName=req.params.name
        const existingCategory = await Categories.findOne({ name: { $regex: new RegExp(pdtName, 'i') } });

        if(existingCategory){
            res.json(true)
        }else{
            res.json(false)
        }
       

    }catch(e){
        next(e)
    }
  }

module.exports = {
    getCategories,
    getSearchCategory,
    getEditCategory,
    getdeleteCategory,
    postCategory,
    postEditCategory,
    deleteCategoryImage,
    addCategoryNameCheck
}