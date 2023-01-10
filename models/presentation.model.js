import mongoose from 'mongoose';

const Presentation = new mongoose.Schema({
  name: { type: String, required: true },
  isPublic: { type: Boolean, required: true },
  isPresent: { type: Boolean, required: true },
  slides: {
    type: String
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    require: true,
  },
  groupId: {
    type: String
  },
  collaborators: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  chat: [{ type: String }]
});

export default mongoose.model('Presentation', Presentation);
