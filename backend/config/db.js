const mongoose = require("mongoose");

const db = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error(error.message);
  }
};

module.exports = db;
