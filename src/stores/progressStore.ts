import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Progress, PracticeStatus } from '../data/types'

interface ProgressStore extends Progress {
  addStars: (count: number) => void
  updatePracticeStatus: (practiceId: string, status: PracticeStatus, score?: number) => void
  completePractice: (practiceId: string, score: number, stars: number) => void
  addBadge: (badgeId: string) => void
  unlockOutfit: (outfitId: string) => void
  getPracticeProgress: (practiceId: string) => Progress['practices'][string] | undefined
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      totalStars: 0,
      earnedBadges: [],
      outfits: [],
      practices: {},

      addStars: (count: number) => 
        set((state) => ({ totalStars: state.totalStars + count })),

      updatePracticeStatus: (practiceId: string, status: PracticeStatus, score?: number) =>
        set((state) => ({
          practices: {
            ...state.practices,
            [practiceId]: {
              ...state.practices[practiceId],
              status,
              ...(score !== undefined && { bestScore: score }),
              attempts: (state.practices[practiceId]?.attempts ?? 0) + 1,
              lastPlayed: new Date().toISOString(),
            },
          },
        })),

      completePractice: (practiceId: string, score: number, stars: number) =>
        set((state) => {
          const existing = state.practices[practiceId]
          const isBetter = !existing || score > existing.bestScore
          return {
            totalStars: isBetter ? state.totalStars + stars : state.totalStars,
            practices: {
              ...state.practices,
              [practiceId]: {
                status: 'completed',
                bestScore: isBetter ? score : existing?.bestScore ?? 0,
                starsEarned: isBetter ? stars : existing?.starsEarned ?? 0,
                attempts: (existing?.attempts ?? 0) + 1,
                lastPlayed: new Date().toISOString(),
              },
            },
          }
        }),

      addBadge: (badgeId: string) =>
        set((state) => ({
          earnedBadges: state.earnedBadges.includes(badgeId)
            ? state.earnedBadges
            : [...state.earnedBadges, badgeId],
        })),

      unlockOutfit: (outfitId: string) =>
        set((state) => ({
          outfits: state.outfits.includes(outfitId)
            ? state.outfits
            : [...state.outfits, outfitId],
        })),

      getPracticeProgress: (practiceId: string) => get().practices[practiceId],
    }),
    {
      name: 'guitar-progress',
    }
  )
)
