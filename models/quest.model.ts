import { ObjectId, Schema, model, models } from "mongoose";
import { Document } from "mongoose";

// Type for Achievement
export interface IAchievement {
  name: string;
  description?: string;
  icon: string;
}

// Type for Task


export interface ITask {
  category: "physical" | "mind" | "emotional" | "social" | "career";
  title: string;
  description?: string;
  xp: number;
  isCompleted?: boolean;
  completedAt?: Date;
  totalProgress: number;
  doneProgress: number;
  _id: string;
}


// Type for Quest
export interface IQuest {
  userTelegramId: string;
  title: string;
  description?: string;
  isDaily?: boolean;
  deadline?: Date;
  achievement?: IAchievement;
  tasks: ITask[];
  createdAt: Date;
  updatedAt: Date;
  isCompleted: boolean;
  completedAt?: Date;
}
export interface IQuestResponse extends IQuest {
  _id: string;
}

export interface IQuestModel extends IQuest, Document {}

const AchievementSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  icon: { type: String, required: true },
});

const TaskSchema = new Schema(
  {
    category: {
      type: String,
      enum: ["physical", "mind", "emotional", "social", "career"],
    },
    title: { type: String, required: true },
    description: String,
    xp: { type: Number, default: 10 },
    isCompleted: { type: Boolean, default: false },
    completedAt: Date,
    totalProgress: { type: Number, default: 5, required: true },
    doneProgress: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const QuestSchema = new Schema(
  {
    userTelegramId: { type: String, required: true },
    title: { type: String, unique: true },
    description: String,
    isDaily: { type: Boolean, default: false },
    deadline: { type: Date },
    achievement: { type: AchievementSchema, required: false },
    tasks: { type: [TaskSchema], default: [] },
    isCompleted: { type: Boolean, default: false },
    completedAt: Date,
  },
  { timestamps: true }
);

// Check if the model already exists
const QuestModel = models.Quest || model("Quest", QuestSchema);

export default QuestModel;
