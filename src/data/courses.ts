import type { Course, Reward } from './types'

export const courses: Course[] = [
  {
    id: 'course-1',
    title: '入门课程',
    emoji: '🌟',
    coverColor: '#FFB347',
    lessons: [
      {
        id: 'lesson-1-1',
        title: '认识吉他',
        duration: 120,
        starsToUnlock: 0,
        content: {},
      },
      {
        id: 'lesson-1-2',
        title: '拨弦练习',
        duration: 180,
        starsToUnlock: 0,
        content: {},
      },
      {
        id: 'lesson-1-3',
        title: '节奏练习',
        duration: 200,
        starsToUnlock: 3,
        content: {},
      },
    ],
  },
  {
    id: 'course-2',
    title: '和弦入门',
    emoji: '🎸',
    coverColor: '#87CEEB',
    lessons: [
      {
        id: 'lesson-2-1',
        title: 'C大调音阶',
        duration: 300,
        starsToUnlock: 5,
        content: {},
      },
      {
        id: 'lesson-2-2',
        title: 'Em和弦',
        duration: 250,
        starsToUnlock: 8,
        content: {},
      },
    ],
  },
]

export const rewards: Reward[] = [
  { id: 'hat', name: '弹弹的帽子', cost: 10, type: 'outfit', emoji: '🎩' },
  { id: 'sunglasses', name: '弹弹的墨镜', cost: 25, type: 'outfit', emoji: '🕶' },
  { id: 'cape', name: '弹弹的披风', cost: 50, type: 'outfit', emoji: '🦸' },
  { id: 'first-star', name: '第一颗星', cost: 1, type: 'badge', emoji: '⭐' },
  { id: 'week-streak', name: '连续一周', cost: 30, type: 'badge', emoji: '🏆' },
]
