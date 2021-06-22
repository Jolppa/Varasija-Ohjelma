const mongoose = require("mongoose");

exports.connect = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    if (connection) {
      console.log("Connection to Database Established...");
    }
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
