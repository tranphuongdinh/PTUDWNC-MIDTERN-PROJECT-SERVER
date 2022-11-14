import mongoose from "mongoose"
import { MDB_CONNECTION_STRING } from "../../constants/common.js";

async function DbConnect() {
  try {
    console.log('Connect: ' + MDB_CONNECTION_STRING);
    await mongoose.connect(MDB_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connect MongoDB successfully!!!');
  } catch (error) {
    console.log('Connect MongoDB failure!!!');
    console.log(error);
    process.exit(1);
  }
}

export default DbConnect;
