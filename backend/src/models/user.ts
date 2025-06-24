import mongoose from "mongoose";
import { Schema } from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

mongoose.connect(process.env.MONGODB_URI as string);

//mongoose.connect("mongodb://localhost:27017/xchat");

const schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    required: true,
  },
  friends: [
    {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  groups: [
    {
      type: Schema.Types.ObjectId,
      ref: "group",
    },
  ],
  isOnline: {
    type: Boolean,
    required: true,
  },
});

export default mongoose.model("user", schema);
