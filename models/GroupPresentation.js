import mongoose from "mongoose";

const GroupPresentation = new mongoose.Schema({
  groupId: {
    type: String,
  },
  presentationId: {
    type: String,
  },
  userId: {
    type: String,
  },
});

export default mongoose.model("GroupPresentation", GroupPresentation);
