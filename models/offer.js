const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  offerName: String,
  discountPercentage: Number,
   offerFor:String,
  offerForName:String,
  isValid:{
    type:Boolean,
    default:true
  }
  // Add more fields as needed, such as usage limits
});

module.exports = mongoose.model('Offer', offerSchema);
