import mongoose from "mongoose";

const Question = new mongoose.Schema({
  content: { type: String, required: true },
  vote: { type: Number, required: true },
  presentationId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Presentation",
  },
  createDate: { type: Date, default: new Date() },
  userName: {
    type: String,
    required: true,
  },
});

export default mongoose.model("Question", Question);
