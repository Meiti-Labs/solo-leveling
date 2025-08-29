import { Schema, model, models } from "mongoose";

const AchievementSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  icon: { type: String, required: true }
});

const TaskSchema = new Schema({
  category: { type: String, enum: ["physical","mind","emotional","social","career"]},
  title: { type: String, required: true },
  description: String,
  xp: { type: Number, default: 10 },
  isCompleted: { type: Boolean, default: false },
  completedAt: Date,
  totalProgress: Number,
  doneProgress: Number
}, { timestamps: true });

const QuestSchema = new Schema(
  {
    userTelegramId: { type: String, required: true },
    title: {type: String, unique: true},
    description: String,
    isDaily: { type: Boolean, default: false },
    deadline: {type: Date},
    achievement: { type: AchievementSchema, required: false},
    tasks: {type: [TaskSchema], default: []}

  },
  { timestamps: true }
);

// Check if the model already exists
const QuestModel = models.Quest || model('Quest', QuestSchema);

export default QuestModel;
