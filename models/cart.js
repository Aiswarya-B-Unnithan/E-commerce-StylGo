const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', 
        required: true
      },
      color:{
        type:String,
        required:true,
      },
      size:{
        type:String,
        required:true
      },
      stock: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1 
      }
    }
  ],
  totalPrice: {
    type: Number,
    default: 0
  },
  couponApplied:String,
  couponAmount:Number,
  
  totalQuantity: {
    type: Number,
    default: 0
  }
},
{ timestamps:true}
);

cartSchema.pre(/^find/, function (next) {
  this.populate('user').populate('items.product');
  next();
});

module.exports = mongoose.model('Cart', cartSchema);

