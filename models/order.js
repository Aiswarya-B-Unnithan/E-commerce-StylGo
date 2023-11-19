const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true,
    },
    address: {
        // Store the selected address details here
        houseNo: String,
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: String,
    },
    
    paymentMethod: {
        type: String, // Store the payment method (e.g., 'Paypal', 'Direct Check', 'Bank Transfer')
        required: true,
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
          quantity: {
            type: Number,
            required: true,
            default: 1 
          }
        }
      ],
    
    totalAmount: {
        type: Number,
        required: true,
    },
    orderDate: {
        type: Date,
        default: Date.now,
    },
    status:{
        type:String,
        default:'pending'
    }
    // Add any other order-related fields you need
});

   orderSchema.pre(/^find/, function (next) {
        this.populate('user').populate('items.product')
        next();
      });


const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
