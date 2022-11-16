import mongoose from 'mongoose';

const User = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    myGroupIds: [
      { type: mongoose.Types.ObjectId, required: true, ref: 'Group' },
    ],
    joinedGroupIds: [
      { type: mongoose.Types.ObjectId, required: true, ref: 'Group' },
    ],
    isActive: {type: Boolean, required: true}
  }
);

export default mongoose.model('User', User);

