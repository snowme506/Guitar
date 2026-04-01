import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Lesson } from '../data/types'

export interface MissionContent {
  sheet?: { type: 'upload' | 'url'; imageUrl?: string }
  chordDiagram?: string
  musicXml?: string
  standardNotes?: { time: number; string: number; fret: number; duration?: number }[]
}

export interface Mission {
  id: string
  courseId: string
  lessonId: string
  title: string
  emoji: string
  starReward: number
  type: 'newLesson' | 'practice' | 'review'
  status: 'locked' | 'available' | 'inProgress' | 'completed'
  unlockedBy?: string
  completedAt?: string
  content: MissionContent  // 谱子、录音等课程内容直接存在任务里
}

interface MissionStore {
  missions: Mission[]
  activeMissionId: string | null
  
  // Actions
  initializeMissions: (courses: { id: string; title: string; emoji: string; lessons: (Lesson & { courseEmoji?: string })[] }[]) => void
  startMission: (missionId: string) => void
  completeMission: (missionId: string) => void
  updateMissionContent: (missionId: string, content: Partial<MissionContent>) => void
  getAvailableMissions: () => Mission[]
  getTodayMissions: () => Mission[]
  resetMissions: () => void
}

export const useMissionStore = create<MissionStore>()(
  persist(
    (set, get) => ({
      missions: [],
      activeMissionId: null,

      initializeMissions: (courses) => {
        const missions: Mission[] = []
        let order = 1
        
        courses.forEach(course => {
          course.lessons.forEach((lesson, index) => {
            missions.push({
              id: `mission-${lesson.id}`,
              courseId: course.id,
              lessonId: lesson.id,
              title: lesson.title,
              emoji: order === 1 ? '🌟' : order === 2 ? '🎵' : order === 3 ? '🎸' : '🎶',
              starReward: Math.min(3, Math.floor(index / 2) + 1),
              type: 'newLesson',
              status: index === 0 ? 'available' : 'locked',
              unlockedBy: index > 0 ? `mission-${course.lessons[index - 1].id}` : undefined,
              content: {
                sheet: lesson.content?.sheet,
                chordDiagram: lesson.content?.chordDiagram,
                musicXml: lesson.content?.musicXml,
                standardNotes: lesson.standardNotes,
              },
            })
            order++
          })
        })
        
        set({ missions })
      },

      startMission: (missionId) => {
        set(state => ({
          missions: state.missions.map(m =>
            m.id === missionId 
              ? { ...m, status: 'inProgress' as const }
              : m
          ),
          activeMissionId: missionId,
        }))
      },

      completeMission: (missionId) => {
        const { missions } = get()
        const nextMissionIndex = missions.findIndex(m => m.id === missionId) + 1
        
        set(state => ({
          missions: state.missions.map((m, index) => {
            if (m.id === missionId) {
              return { ...m, status: 'completed' as const, completedAt: new Date().toISOString() }
            }
            if (index === nextMissionIndex && m.status === 'locked') {
              return { ...m, status: 'available' as const }
            }
            return m
          }),
          activeMissionId: null,
        }))
      },

      updateMissionContent: (missionId, content) => {
        set(state => ({
          missions: state.missions.map(m =>
            m.id === missionId 
              ? { ...m, content: { ...m.content, ...content } }
              : m
          ),
        }))
      },

      getAvailableMissions: () => {
        return get().missions.filter(m => m.status === 'available')
      },

      getTodayMissions: () => {
        const { missions } = get()
        return missions.filter(m => 
          m.status === 'available' || m.status === 'inProgress'
        ).slice(0, 3)
      },

      resetMissions: () => {
        set({ missions: [], activeMissionId: null })
      },
    }),
    {
      name: 'guitar-missions',
    }
  )
)
