import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Progress } from '../data/types'

interface ProgressStore extends Progress {
  addStars: (count: number) => void
  completeCourse: (courseId: string, score: number, stars: number) => void
  addBadge: (badgeId: string) => void
  unlockOutfit: (outfitId: string) => void
  getCourseProgress: (courseId: string) => Progress['courses'][string] | undefined
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      totalStars: 0,
      earnedBadges: [],
      outfits: [],
      courses: {},

      addStars: (count: number) => 
        set((state) => ({ totalStars: state.totalStars + count })),

      completeCourse: (courseId: string, score: number, stars: number) =>
        set((state) => {
          const existing = state.courses[courseId]
          const isBetter = !existing || score > existing.bestScore
          return {
            totalStars: isBetter ? state.totalStars + stars : state.totalStars,
            courses: {
              ...state.courses,
              [courseId]: {
                completed: true,
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

      getCourseProgress: (courseId: string) => get().courses[courseId],
    }),
    {
      name: 'guitar-progress',
    }
  )
)
