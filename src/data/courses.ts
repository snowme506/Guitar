import type { Practice, Reward } from './types'

export const practices: Practice[] = [
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

export const rewards: Reward[] = [
  { id: 'hat', name: '弹弹的帽子', cost: 10, type: 'outfit', emoji: '🎩' },
  { id: 'sunglasses', name: '弹弹的墨镜', cost: 25, type: 'outfit', emoji: '🕶' },
  { id: 'cape', name: '弹弹的披风', cost: 50, type: 'outfit', emoji: '🦸' },
  { id: 'first-star', name: '第一颗星', cost: 1, type: 'badge', emoji: '⭐' },
  { id: 'week-streak', name: '连续一周', cost: 30, type: 'badge', emoji: '🏆' },
]
