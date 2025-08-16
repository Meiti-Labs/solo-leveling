import { Schema, model } from "mongoose";
const categorySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    color: String, // optional UI feature
  },
  {
    timestamps: true,
  }
);

module.exports = model("Category", categorySchema);
