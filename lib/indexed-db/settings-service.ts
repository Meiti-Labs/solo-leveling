import { db } from "./database";

const now = () => new Date().toISOString();

export const settingsService = {
  async get<TValue>(key: string): Promise<TValue | undefined> {
    const setting = await db.settings.get(key);
    return setting?.value as TValue | undefined;
  },

  async set<TValue>(key: string, value: TValue): Promise<void> {
    await db.settings.put({
      key,
      value,
      updatedAt: now(),
    });
  },

  async delete(key: string): Promise<void> {
    await db.settings.delete(key);
  },

  async clear(): Promise<void> {
    await db.settings.clear();
  },
};
