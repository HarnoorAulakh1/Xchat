import { Schema } from "mongoose";
import { model } from "mongoose";

const schema = new Schema({
  name: { type: String, required: true,  unique: false },
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
  description: { type: String, required: false },
  created_at: { type: Date, default: Date.now },
});


export default model("group", schema);