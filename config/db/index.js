const mongoose = require("mongoose");
const { MDB_CONNECTION_STRING } = require("../../constants/common");

async function connect() {
  try {
    console.log("Connect: " + MDB_CONNECTION_STRING);
    await mongoose.connect(MDB_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connect MongoDB successfully!!!");
  } catch (error) {
    console.log("Connect MongoDB failure!!!");
    console.log(error);
    process.exit(1);
  }
}

module.exports = { connect };
