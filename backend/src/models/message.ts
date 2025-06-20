import { Schema, model } from "mongoose";

const messageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: "user", required: true },
  receiver: { type: Schema.Types.ObjectId, ref: "user", required: false }, 
  content: { type: String, required: true },
  group: { type: Schema.Types.ObjectId, ref: "group", required: false },
  image: { type: String, required: false },
  file: {
    name: { type: String, required: false },
    link: { type: String, required: false },
    type: { type: String, required: false },
  },
  isRead: [{
    user: { type: Schema.Types.ObjectId, ref: "user", required: true },
    readAt: { type: Date, default: Date.now },
  }],
  created_at: { type: Date, default: Date.now },
});

export default model("message", messageSchema);
