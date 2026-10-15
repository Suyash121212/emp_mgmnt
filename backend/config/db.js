const mongoose = require('mongoose');
const { MONGODB_URI } = require('./index');

const dns = require("dns");
dns.setServers(["8.8.8.8","1.1.1.1"])


const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
