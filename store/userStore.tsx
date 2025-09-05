"use client";

import { IQuestResponse } from "@/models/quest.model";
import { ObjectId } from "mongoose";
import { create } from "zustand";

export interface IUserData {
  _id: ObjectId;
  telegramId: string;
  username: string;
  totalXP: number;
  level: number;
  cash: number;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

interface UserState {
  user: IUserData | undefined;
  update: (newUser: IUserData) => void;
  quests: IQuestResponse[] | undefined;
  updateQuests: (quest: IQuestResponse[]) => void;
}

export const userStore = create<UserState>()((set) => ({
  user: undefined,
  update: (newUser) => set(() => ({ user: newUser })),
  quests: [],
  updateQuests: (quest) => set(() => ({ quests: quest })),
}));
