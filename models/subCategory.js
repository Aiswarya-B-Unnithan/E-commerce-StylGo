const mongoose=require('mongoose')

const subCategorySchema= new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique:true,
        uppercase:true
        //collation: { locale: 'en', strength: 2 },
        
      },
      description: {
        type: String,
        required: true,    
      },
    //  images: [{
    //     data:Buffer,
    //     contentType:String        
    //   }],
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


module.exports=mongoose.model("SubCategory",subCategorySchema)

