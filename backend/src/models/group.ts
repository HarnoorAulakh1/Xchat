import { Schema } from "mongoose";
import { model } from "mongoose";

const schema = new Schema({
  name: { type: String, required: true,  unique: true },
  logo: { type: String, required: false },
  admins: [{ type: Schema.Types.ObjectId, ref: "user" }],
  members: [{ type: Schema.Types.ObjectId, ref: "user" }],
  saved: [
    {
      type: String,
      link: String,
      name: String,
    },
  ],
  description: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});


export const group = model("group", schema);