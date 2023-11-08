const mongoose=require('mongoose')

const categorySchema= new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique:true,
        // not in my version// collation: { locale: 'en', strength: 2 },// collation option for the name field in the schema. The locale option is set to 'en' (English) to indicate the collation rules for English language, and strength is set to 2 to indicate case-sensitive comparison.
        
      },
      description: {
        type: String,
        required: true,    
      },
    /* images: [{
        data:Buffer,
        contentType:String        
      }],*/
      images:[String],
      stock:{
        type:Number
      },
    
    isValid: {
      type:Boolean,
      default:true
    }
  },
    { timestamps:true}

)

// // Add the pre-save middleware to check for uniqueness
// categorySchema.pre('save', async function (next) {
//   try {
//     const existingCategory = await Category.findOne({
//       name: { $regex: new RegExp(`^${this.name}$`, 'i') }, // Case-insensitive search
//     });

//     if (existingCategory) {
//       throw new Error('Category with the same name already exists.');
//     }

//     next();
//   } catch (error) {
//     next(error);
//   }
// });

const Category=mongoose.model("Category",categorySchema)
module.exports=Category

