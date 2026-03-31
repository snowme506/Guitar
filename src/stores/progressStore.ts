import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Practice, PracticeStatus } from '../data/types'

interface ProgressStore {
  // 星星和奖励
  totalStars: number
  earnedBadges: string[]
  outfits: string[]
  
  // 练习数据
  practices: Practice[]
  
  // 练习进度
  practiceProgress: {
    [practiceId: string]: {
      status: PracticeStatus
      bestScore: number
      starsEarned: number
      attempts: number
      lastPlayed: string
    }
  }
  
  // Actions
  addStars: (count: number) => void
  addPractice: (practice: Omit<Practice, 'status' | 'attempts'>) => void
  updatePractice: (id: string, updates: Partial<Practice>) => void
  deletePractice: (id: string) => void
  addBadge: (badgeId: string) => void
  unlockOutfit: (outfitId: string) => void
  updatePracticeStatus: (practiceId: string, status: PracticeStatus, score?: number) => void
  completePractice: (practiceId: string, score: number, stars: number) => void
  getPracticeProgress: (practiceId: string) => ProgressStore['practiceProgress'][string] | undefined
}

const initialPractices: Practice[] = [
  {
    id: 'practice-1',
    title: '认识吉他',
    emoji: '🌟',
    coverColor: '#FFB347',
    date: '2026-03-30',
    status: 'completed',
    score: 85,
    attempts: 1,
  },
  {
    id: 'practice-2',
    title: '拨弦练习',
    emoji: '🎸',
    coverColor: '#87CEEB',
    date: '2026-03-31',
    status: 'in_progress',
    attempts: 1,
  },
  {
    id: 'practice-3',
    title: '和弦入门',
    emoji: '🎵',
    coverColor: '#98D8AA',
    date: '2026-03-31',
    status: 'pending',
    attempts: 0,
  },
]

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      totalStars: 0,
      earnedBadges: [],
      outfits: [],
      practices: initialPractices,
      practiceProgress: {},

      addStars: (count: number) => 
        set((state) => ({ totalStars: state.totalStars + count })),

      addPractice: (practice) =>
        set((state) => ({
          practices: [...state.practices, { ...practice, status: 'pending' as PracticeStatus, attempts: 0 }]
        })),

      updatePractice: (id, updates) =>
        set((state) => ({
          practices: state.practices.map(p => p.id === id ? { ...p, ...updates } : p)
        })),

      deletePractice: (id) =>
        set((state) => ({
          practices: state.practices.filter(p => p.id !== id)
        })),

      addBadge: (badgeId) =>
        set((state) => ({
          earnedBadges: state.earnedBadges.includes(badgeId)
            ? state.earnedBadges
            : [...state.earnedBadges, badgeId],
        })),

      unlockOutfit: (outfitId) =>
        set((state) => ({
          outfits: state.outfits.includes(outfitId)
            ? state.outfits
            : [...state.outfits, outfitId],
        })),

      updatePracticeStatus: (practiceId, status, score) =>
        set((state) => ({
          practiceProgress: {
            ...state.practiceProgress,
            [practiceId]: {
              ...state.practiceProgress[practiceId],
              status,
              ...(score !== undefined && { bestScore: score }),
              attempts: (state.practiceProgress[practiceId]?.attempts ?? 0) + 1,
              lastPlayed: new Date().toISOString(),
            },
          },
        })),

      completePractice: (practiceId, score, stars) =>
        set((state) => {
          const existing = state.practiceProgress[practiceId]
          const isBetter = !existing || score > existing.bestScore
          return {
            totalStars: isBetter ? state.totalStars + stars : state.totalStars,
            practiceProgress: {
              ...state.practiceProgress,
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

      getPracticeProgress: (practiceId) => get().practiceProgress[practiceId],
    }),
    {
      name: 'guitar-progress',
    }
  )
)
