const Razorpay = require('razorpay');
require('dotenv').config()

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_ID,
  key_secret: process.env.RAZORPAY_KEY,
});

module.exports=razorpay