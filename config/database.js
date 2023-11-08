const mongoose = require("mongoose");
require('dotenv').config()

const connectDB = async () => {
  try {
    //mongodb connection string
    const connection = await mongoose
      .connect(process.env.MONGODB_URI)
      .then(() => {
        console.log(`connected`);
      });
  } catch (err) {
    console.log(err);
  }
};

module.exports = connectDB;
