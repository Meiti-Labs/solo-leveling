import { db } from "./database";
import { createCrudService } from "./crud-service";
import type { CreateEntity, UserProfile } from "./types";

const profileCrud = createCrudService<UserProfile>(db.profiles);

export const profileService = {
  ...profileCrud,

  async getByTelegramId(telegramId: number): Promise<UserProfile | undefined> {
    return db.profiles.where("telegramId").equals(telegramId).first();
  },

  async upsertTelegramProfile(
    input: CreateEntity<UserProfile> & { telegramId: number },
  ): Promise<UserProfile> {
    const existing = await this.getByTelegramId(input.telegramId);

    return profileCrud.upsert({
      ...input,
      id: input.id ?? existing?.id,
    });
  },
};
