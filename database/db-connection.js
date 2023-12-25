const mongoose = require("mongoose");
require("dotenv").config();

const initializeConnection = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}`);
    console.log("Connected to database");
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  initializeConnection,
};
