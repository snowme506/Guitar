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
        content: {
          sheet: { type: 'url', imageUrl: '' },
          chordDiagram: 'C大调音阶: E-F-G-A-B-C-D-E',
        },
        standardNotes: [
          { time: 0, string: 1, fret: 0 },
          { time: 1, string: 1, fret: 1 },
          { time: 2, string: 1, fret: 2 },
          { time: 3, string: 1, fret: 3 },
        ],
      },
      {
        id: 'lesson-1-2',
        title: '拨弦练习',
        duration: 180,
        starsToUnlock: 0,
        content: {
          sheet: { type: 'url', imageUrl: '' },
          chordDiagram: '空弦练习: 每根弦单独拨响',
        },
        standardNotes: [
          { time: 0, string: 1, fret: 0 },
          { time: 1, string: 2, fret: 0 },
          { time: 2, string: 3, fret: 0 },
          { time: 3, string: 4, fret: 0 },
        ],
      },
      {
        id: 'lesson-1-3',
        title: '节奏练习',
        duration: 200,
        starsToUnlock: 3,
        content: {
          sheet: { type: 'url', imageUrl: '' },
          chordDiagram: '4/4拍节奏型',
        },
        standardNotes: [
          { time: 0, string: 5, fret: 0 },
          { time: 0.5, string: 4, fret: 0 },
          { time: 1, string: 3, fret: 0 },
          { time: 1.5, string: 2, fret: 0 },
        ],
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
        content: {
          sheet: { type: 'url', imageUrl: '' },
          chordDiagram: 'C - Am - F - G',
        },
        standardNotes: [
          { time: 0, string: 5, fret: 3 },
          { time: 1, string: 5, fret: 3 },
          { time: 2, string: 4, fret: 2 },
          { time: 3, string: 3, fret: 0 },
        ],
      },
      {
        id: 'lesson-2-2',
        title: 'Em和弦',
        duration: 250,
        starsToUnlock: 8,
        content: {
          sheet: { type: 'url', imageUrl: '' },
          chordDiagram: 'Em: 2-3-2',
        },
        standardNotes: [
          { time: 0, string: 6, fret: 2 },
          { time: 0, string: 3, fret: 2 },
        ],
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
