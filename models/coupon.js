const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  customer: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
  }],
  couponName: String,
  couponCode:{
    type:String,
    unique:true
  },
  discountValue: Number,
  discountType: { type: String, enum: ["percentage", "fixed"] },
  couponFor:String,
  couponForName:String,
  description:String,
  minPurchaseAmt: Number,
  startDate: Date,
  endDate: Date,

  // Add more fields as needed, such as usage limits
});

module.exports = mongoose.model('Coupon', couponSchema);
