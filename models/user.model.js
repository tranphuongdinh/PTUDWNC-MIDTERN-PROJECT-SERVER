import mongoose from "mongoose";

const User = new mongoose.Schema(
  {
    name: { type: String, require: true },
    email: { type: String },
    password: { type: String },
    googleId: { type: String },
    githubId: { type: String },
  },
  { collection: "user-data" }
);

export default mongoose.model("UserData", User);
