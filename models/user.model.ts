import { Schema, model, models } from "mongoose";

// SubSkill schema
const SubSkillSchema = new Schema({
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
});

// Category schema (map of subskills)
const CategorySchema = new Schema({
  type: Map,
  of: SubSkillSchema,
  default: {}
});

// Achievement schema
const AchievementSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  date: { type: Date, default: Date.now },
  icon: { type: String, required: true }
});



// Main User schema
const userSchema = new Schema(
  {
    telegramId: { type: String, required: true, unique: true },
    username: String,
    totalXP: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    cash: { type: Number, default: 0 },

    // Categories
    categories: {
      physical: { type: CategorySchema, default: {} },
      mind: { type: CategorySchema, default: {} },
      emotional: { type: CategorySchema, default: {} },
      social: { type: CategorySchema, default: {} },
      career: { type: CategorySchema, default: {} }
    },

    achievements: { type: [AchievementSchema], default: [] }
  },
  { timestamps: true }
);

// Check if the model already exists
const UserModel = models.User || model("User", userSchema);

export default UserModel;
