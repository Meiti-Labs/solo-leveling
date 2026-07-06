import { db } from "./database";
import { createCrudService } from "./crud-service";
import type { CreateEntity, TaskDefinition, TaskKind } from "./types";

const taskCrud = createCrudService<TaskDefinition>(db.tasks);

export const questService = {
  ...taskCrud,

  async createQuest(input: CreateEntity<TaskDefinition>): Promise<TaskDefinition> {
    return taskCrud.create({
      ...input,
      status: input.status ?? "active",
      coinReward: input.coinReward ?? 0,
      gemReward: input.gemReward ?? 0,
      missedPenaltyXp: input.missedPenaltyXp ?? Math.round(input.xpReward * 0.3),
      isDefault: input.isDefault ?? false,
    });
  },

  async listByKind(kind: TaskKind): Promise<TaskDefinition[]> {
    return db.tasks.where("kind").equals(kind).reverse().sortBy("updatedAt");
  },

  async listActive(): Promise<TaskDefinition[]> {
    return db.tasks.where("status").equals("active").toArray();
  },
};
