const mongoose=require('mongoose')

const userSchema= new mongoose.Schema({
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
      mobileNo:{
        type: String,
        required: true,
        
      },
      profileImage:{
        type:String,
        required:false
      },
      orders:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Order'
      }],
      addresses: [{
        houseNo: String,
        street: String,
        city: String,
        state: String,
        postalcode: String,
        country: String,
      }],
      wallets:[{
        transactionType:String,
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Order', 
      },
        amount:Number,
        date: { type: Date, default: Date.now }
      }],
      walletTotal:{
        type:Number,
        default:0
      },
    isBlocked:{
        type:Boolean,
        default:false
    },
    otp:{
      type:String
    }
},{ timestamps:true})

// userSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'orders',
//     options: { 
//       // Add a condition to populate 'orders' only if it is not an empty array
//       match: { $expr: { $ne: [{ $size: '$orders' }, 0] } }
//     }
//   });
//   next();
// });

module.exports=mongoose.model("User",userSchema)