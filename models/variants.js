const mongoose=require('mongoose')

const variantSchema= new mongoose.Schema({
  productId:{
    type:String,
    required:true
  },

  color:{
    type:String,
    required:true
  },
  stock:{
    type:Number
    
  },
  sizes:[{
            size:String,
            quantity:Number
      }]
  })

  module.exports=mongoose.model("Variants",variantSchema)
