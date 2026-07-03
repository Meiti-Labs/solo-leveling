import { db } from "./database";
import { createCrudService } from "./crud-service";
import type { CreateEntity, Quest } from "./types";

const questCrud = createCrudService<Quest>(db.quests);

export const questService = {
  ...questCrud,

  async createQuest(input: CreateEntity<Quest>): Promise<Quest> {
    return questCrud.create({
      ...input,
      status: input.status ?? "todo",
      xpReward: input.xpReward ?? 0,
      isDaily: input.isDaily ?? false,
    });
  },

  async listDaily(): Promise<Quest[]> {
    return db.quests.where("isDaily").equals(1).reverse().sortBy("updatedAt");
  },

  async listByStatus(status: Quest["status"]): Promise<Quest[]> {
    return db.quests.where("status").equals(status).reverse().sortBy("updatedAt");
  },

  async complete(id: string): Promise<Quest> {
    return questCrud.update(id, {
      status: "completed",
      completedAt: new Date().toISOString(),
    });
  },
};
