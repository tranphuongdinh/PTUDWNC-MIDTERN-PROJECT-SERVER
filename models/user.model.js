import mongoose from "mongoose";

const User = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  password: { type: String },
  myGroupIds: [{ type: mongoose.Types.ObjectId, required: true, ref: "Group" }],
  joinedGroupIds: [{ type: mongoose.Types.ObjectId, required: true, ref: "Group" }],
  presentationIds: [{ type: mongoose.Types.ObjectId, required: true, ref: "Presentation" }],
  isActive: { type: Boolean, required: true },
  activeCode: { type: String },
});

export default mongoose.model("User", User);
