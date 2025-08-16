import { Schema, model } from "mongoose";


const userSchema = new Schema(
  {
    telegramId: { type: String, required: true, unique: true },
    username: String,
    totalXP: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    cash: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default model('User', userSchema);
