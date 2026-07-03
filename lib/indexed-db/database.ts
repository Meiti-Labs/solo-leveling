import Dexie, { type Table } from "dexie";
import type { AppSetting, Quest, UserProfile } from "./types";

class SoloLevelingDatabase extends Dexie {
  profiles!: Table<UserProfile, string>;
  quests!: Table<Quest, string>;
  settings!: Table<AppSetting, string>;

  constructor() {
    super("solo-leveling-mini");

    this.version(1).stores({
      profiles: "id, telegramId, username, updatedAt",
      quests: "id, status, isDaily, completedAt, updatedAt",
      settings: "key, updatedAt",
    });
  }
}

export const db = new SoloLevelingDatabase();
