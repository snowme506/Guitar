import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Mission {
  id: string
  courseId: string
  lessonId: string
  title: string
  description: string
  emoji: string
  starReward: number // 1-3 stars
  type: 'newLesson' | 'practice' | 'review'
  status: 'locked' | 'available' | 'inProgress' | 'completed'
  unlockedBy?: string // missionId that unlocked this
  completedAt?: string
}

interface MissionStore {
  missions: Mission[]
  activeMissionId: string | null
  
  // Actions
  initializeMissions: (courses: { id: string; lessons: { id: string; title: string }[] }[]) => void
  startMission: (missionId: string) => void
  completeMission: (missionId: string) => void
  getAvailableMissions: () => Mission[]
  getTodayMissions: () => Mission[]
  getMissionProgress: (missionId: string) => { started: boolean; completed: boolean }
  resetMissions: () => void
}

// Default missions for demo
const defaultMissions: Mission[] = [
  {
    id: 'mission-1',
    courseId: 'course-1',
    lessonId: 'lesson-1-1',
    title: '认识吉他',
    description: '了解吉他的各个部分，学会正确持琴姿势',
    emoji: '🎸',
    starReward: 1,
    type: 'newLesson',
    status: 'available',
  },
  {
    id: 'mission-2',
    courseId: 'course-1',
    lessonId: 'lesson-1-2',
    title: '拨弦练习',
    description: '跟着节拍器，练习拨弦的基本动作',
    emoji: '🎵',
    starReward: 2,
    type: 'newLesson',
    status: 'locked',
    unlockedBy: 'mission-1',
  },
]

export const useMissionStore = create<MissionStore>()(
  persist(
    (set, get) => ({
      missions: defaultMissions,
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
              description: `完成 ${lesson.title} 的学习和练习`,
              emoji: index === 0 ? '🌟' : index === 1 ? '🎵' : '🎸',
              starReward: Math.min(3, Math.floor(index / 2) + 1),
              type: 'newLesson',
              status: index === 0 ? 'available' : 'locked',
              unlockedBy: index > 0 ? `mission-${course.lessons[index - 1].id}` : undefined,
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
        const mission = missions.find(m => m.id === missionId)
        if (!mission) return

        // Mark this mission as completed
        // Unlock the next mission
        const nextMissionIndex = missions.findIndex(m => m.id === missionId) + 1
        
        set(state => ({
          missions: state.missions.map((m, index) => {
            if (m.id === missionId) {
              return { ...m, status: 'completed' as const, completedAt: new Date().toISOString() }
            }
            // Unlock next mission
            if (index === nextMissionIndex && m.status === 'locked') {
              return { ...m, status: 'available' as const }
            }
            return m
          }),
          activeMissionId: null,
        }))
      },

      getAvailableMissions: () => {
        return get().missions.filter(m => m.status === 'available')
      },

      getTodayMissions: () => {
        const { missions } = get()
        // Return available + inProgress missions as "today's missions"
        return missions.filter(m => 
          m.status === 'available' || m.status === 'inProgress'
        ).slice(0, 3) // Max 3 per day
      },

      getMissionProgress: (missionId) => {
        const mission = get().missions.find(m => m.id === missionId)
        return {
          started: mission?.status === 'inProgress' || mission?.status === 'completed',
          completed: mission?.status === 'completed',
        }
      },

      resetMissions: () => {
        set({ missions: defaultMissions, activeMissionId: null })
      },
    }),
    {
      name: 'guitar-missions',
    }
  )
)
