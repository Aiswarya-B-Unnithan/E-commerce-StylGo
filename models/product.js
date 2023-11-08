const mongoose=require('mongoose')

const productSchema= new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique:true
        
      },
      price: {
        type: Number,
        required: true,    
      },
      category:{
        // type:String,
        // required:true
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category'
    },
    subCategory:{
      // type:String,
      // required:true
     type:mongoose.Schema.Types.ObjectId,
      ref:'SubCategory'
    },
    /* images: [{
        data:Buffer,
        contentType:String        
      }],*/
      images:[String],
      variants:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Variants'
    }],
      description:{
        type:String,
        required:true
      },
      stock:{
        type:Number,
        default:0
      },
      rating:{
        type:Number
      },
      review:{
        type:String
      }
      ,
    isValid: {
      type:Boolean,
      default:true
    }
  },
    { timestamps:true}

)

productSchema.pre(/^find/,  async function (next) {
  this.populate('variants').populate('category').populate('subCategory')
  next();
});
module.exports=mongoose.model("Product",productSchema)

