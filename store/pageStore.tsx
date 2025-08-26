"use client"


import { create } from 'zustand'

interface BearState {
  user: IUserData | null,
  update: (newUser: IUserData) => void
}

 export const  userStore = create<BearState>()((set) => ({
  user: null,
  update: (newUser) => set(() => ({ user: newUser })),
}))
