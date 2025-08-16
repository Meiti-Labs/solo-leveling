import { Schema, model, models } from "mongoose";

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

// Check if the model already exists
const UserModel = models.User || model('User', userSchema);

export default UserModel;
