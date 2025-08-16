import { Schema, model } from "mongoose";

const taskSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
  
    title: { type: String, required: true },
    description: String,
  
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 10 },
  
    isCompleted: { type: Boolean, default: false },
    completedAt: Date,
  
    isDaily: { type: Boolean, default: false }, // 🔁 is this a daily task?
    lastCompletedDate: Date // helps reset every day
  }, { timestamps: true });
  
module.exports = model("Task", taskSchema);
