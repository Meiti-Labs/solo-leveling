"use client"


import { ObjectId } from 'mongoose';
import { create } from 'zustand'


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
  user: IUserData | null,
  update: (newUser: IUserData) => void
}

 export const  userStore = create<UserState>()((set) => ({
  user: null,
  update: (newUser) => set(() => ({ user: newUser })),
}))
