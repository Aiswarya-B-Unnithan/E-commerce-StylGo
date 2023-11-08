const mongoose=require('mongoose')

const adminSchema= new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        
      },
      email: {
        type: String,
        required: true,
        unique:true,
       
      },
      password: {
        type: String,
        required: true,
        minlength:8,
        
      },
    otp:{
      type:String
    }
})
module.exports=mongoose.model("Admin",adminSchema)

