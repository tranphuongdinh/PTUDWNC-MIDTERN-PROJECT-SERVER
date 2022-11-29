import mongoose from "mongoose"
import dotenv from 'dotenv'
dotenv.config()

async function DbConnect() {
  try {
    console.log('Connect: ' + process.env.MDB_CONNECTION_STRING);
    await mongoose.connect(process.env.MDB_CONNECTION_STRING, {
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
