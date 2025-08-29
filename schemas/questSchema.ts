import z from "zod";

// 1️⃣ Zod schema
const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.enum(["physical", "mind", "emotional", "social", "career"]),
  totalProgress: z.number().default(1),
  uuid: z.uuidv4("UUID for each task is required.")
});

const achievementSchema = z.object({
  name: z.string().min(1, "Achievement name required"),
  description: z.string().optional(),
  icon: z.string().min(1, "icon image required"),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const questSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  isDaily: z.boolean().default(false),
  deadline: z.string().optional(),
  achievement: achievementSchema.optional(),
  tasks: z.array(taskSchema).min(1, "At least one task required"),
  userTelegramId: z.string("user telegram id is required"),
});