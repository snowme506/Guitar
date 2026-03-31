import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Practice, PracticeStatus } from '../data/types'

interface PracticeProgress {
  status: PracticeStatus
  bestScore: number
  starsEarned: number
  attempts: number
  lastPlayed: string
  // 新增：每日练习追踪
  dailyPracticeCount: number  // 今天练习次数
  lastPracticeDate: string   // 上次练习日期
  completedDays: number      // 完成的天数（每天完成3次算一天）
}

interface ProgressStore {
  // 星星和奖励
  totalStars: number
  earnedBadges: string[]
  outfits: string[]
  
  // 练习数据
  practices: Practice[]
  
  // 练习进度
  practiceProgress: {
    [practiceId: string]: PracticeProgress
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
  // 新增：记录每日练习
  recordDailyPractice: (practiceId: string) => void
  getPracticeProgress: (practiceId: string) => PracticeProgress | undefined
  // 检查是否永久完成（完成3天）
  isPermanentlyCompleted: (practiceId: string) => boolean
  // 获取今天练习次数
  getTodayPracticeCount: (practiceId: string) => number
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
          practices: state.practices.map(p => 
            p.id === practiceId ? { ...p, status } : p
          ),
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
                dailyPracticeCount: existing?.dailyPracticeCount ?? 0,
                lastPracticeDate: existing?.lastPracticeDate ?? '',
                completedDays: existing?.completedDays ?? 0,
              },
            },
          }
        }),

      // 记录每日练习
      recordDailyPractice: (practiceId) => {
        const state = get()
        const today = new Date().toISOString().split('T')[0]
        const progress = state.practiceProgress[practiceId]
        
        // 检查是否是同一天
        const isSameDay = progress?.lastPracticeDate === today
        
        // 如果是同一天，增加计数；否则重置为1
        let newDailyCount = isSameDay ? (progress?.dailyPracticeCount ?? 0) + 1 : 1
        
        // 检查是否完成今天（3次）
        const completedToday = newDailyCount >= 3
        
        // 检查是否永久完成（3天）
        let newCompletedDays = progress?.completedDays ?? 0
        if (completedToday && !isSameDay) {
          // 新的一天完成，加1天
          newCompletedDays += 1
        } else if (completedToday && isSameDay) {
          // 同一天内达到3次，不增加天数
        }
        
        const isPermanentlyCompleted = newCompletedDays >= 3
        
        set((state) => ({
          practices: state.practices.map(p => {
            if (p.id !== practiceId) return p
            // 如果永久完成，状态保持completed
            if (isPermanentlyCompleted) {
              return { ...p, status: 'completed' as PracticeStatus }
            }
            // 否则根据今天是否完成3次来决定状态
            return { ...p, status: completedToday ? 'completed' as PracticeStatus : 'in_progress' as PracticeStatus }
          }),
          practiceProgress: {
            ...state.practiceProgress,
            [practiceId]: {
              ...state.practiceProgress[practiceId],
              status: isPermanentlyCompleted ? 'completed' : (completedToday ? 'completed' : 'in_progress'),
              lastPlayed: new Date().toISOString(),
              lastPracticeDate: today,
              dailyPracticeCount: newDailyCount,
              completedDays: newCompletedDays,
              attempts: (state.practiceProgress[practiceId]?.attempts ?? 0) + 1,
            },
          },
        }))
      },

      getPracticeProgress: (practiceId) => get().practiceProgress[practiceId],

      isPermanentlyCompleted: (practiceId) => {
        const progress = get().practiceProgress[practiceId]
        return (progress?.completedDays ?? 0) >= 3
      },

      getTodayPracticeCount: (practiceId) => {
        const state = get()
        const today = new Date().toISOString().split('T')[0]
        const progress = state.practiceProgress[practiceId]
        if (progress?.lastPracticeDate !== today) {
          return 0
        }
        return progress?.dailyPracticeCount ?? 0
      },
    }),
    {
      name: 'guitar-progress',
    }
  )
)
