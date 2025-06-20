import { Schema } from "mongoose";
import { model } from "mongoose";

const schema = new Schema(
  {
    receiver: { type: Schema.Types.ObjectId, ref: "user", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "user", required: true },
    group: { type: Schema.Types.ObjectId, ref: "team" },
    type: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    expiresAfter: {
      type: Date,
      default: () => new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
      index: { expires: 0 },
    },
  },
  {
    timestamps: true,
  }
);

export const notification = model("notification", schema);
