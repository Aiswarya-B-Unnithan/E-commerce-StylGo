// Assuming you are using Node.js and Mongoose

const mongoose = require('mongoose');

// Define a simplified schema for your data model
const bannerSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  primaryText: {
    type: String,
    required: true,
  },
  secondaryText: {
    type: String,
  },
});

// Create a model based on the schema
const Banner = mongoose.model('Banner', bannerSchema);

// Export the model to use in other parts of your application
module.exports = Banner;
