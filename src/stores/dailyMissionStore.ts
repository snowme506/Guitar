import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface DailyLessonGoal {
  lessonId: string
  title: string
  emoji: string
  targetCount: number  // 需要练习几次
  currentCount: number // 已练习次数
}

export interface DailyMission {
  date: string  // YYYY-MM-DD
  goals: DailyLessonGoal[]
  completed: boolean
  completedAt?: string
  starReward: number  // 完成后奖励多少星星
}

interface DailyMissionStore {
  todayMission: DailyMission | null
  
  // Actions
  initializeDailyMission: (
    courses: { id: string; lessons: { id: string; title: string }[] }[],
    lessonConfigs?: Record<string, { targetCount?: number }>
  ) => void
  recordPractice: (lessonId: string) => void
  completeDailyMission: () => void
  isTodayMissionComplete: () => boolean
  getProgress: (lessonId: string) => { current: number; target: number }
}

const getToday = () => new Date().toISOString().split('T')[0]

export const useDailyMissionStore = create<DailyMissionStore>()(
  persist(
    (set, get) => ({
      todayMission: null,

      initializeDailyMission: (courses, lessonConfigs?: Record<string, { targetCount?: number }>) => {
        const today = getToday()
        const { todayMission } = get()

        // 如果今天的任务已经初始化过了，就不再初始化
        if (todayMission?.date === today) {
          return
        }

        // 生成新的今日任务：选择可用的课程组成今日计划
        const goals: DailyLessonGoal[] = []
        courses.forEach(course => {
          // 每个课程选一个课时作为今日目标
          const firstLesson = course.lessons[0]
          if (firstLesson) {
            const config = lessonConfigs?.[firstLesson.id]
            goals.push({
              lessonId: firstLesson.id,
              title: firstLesson.title,
              emoji: '🎸',  // 默认emoji
              targetCount: config?.targetCount || 2,  // 使用配置的次数或默认2次
              currentCount: 0,
            })
          }
        })

        set({
          todayMission: {
            date: today,
            goals,
            completed: false,
            starReward: goals.length * 2,  // 每个课程奖励2星
          }
        })
      },

      recordPractice: (lessonId) => {
        const { todayMission } = get()
        if (!todayMission || todayMission.completed) return

        set(state => {
          if (!state.todayMission) return state

          const updatedGoals = state.todayMission.goals.map(goal => {
            if (goal.lessonId === lessonId) {
              return { ...goal, currentCount: goal.currentCount + 1 }
            }
            return goal
          })

          // 检查是否所有目标都完成了
          const allCompleted = updatedGoals.every(
            goal => goal.currentCount >= goal.targetCount
          )

          return {
            todayMission: {
              ...state.todayMission,
              goals: updatedGoals,
              completed: allCompleted,
              completedAt: allCompleted ? new Date().toISOString() : undefined,
            }
          }
        })
      },

      completeDailyMission: () => {
        set(state => {
          if (!state.todayMission) return state
          return {
            todayMission: {
              ...state.todayMission,
              completed: true,
              completedAt: new Date().toISOString(),
            }
          }
        })
      },

      isTodayMissionComplete: () => {
        const { todayMission } = get()
        return todayMission?.completed ?? false
      },

      getProgress: (lessonId) => {
        const { todayMission } = get()
        const goal = todayMission?.goals.find(g => g.lessonId === lessonId)
        return {
          current: goal?.currentCount ?? 0,
          target: goal?.targetCount ?? 0,
        }
      },
    }),
    {
      name: 'guitar-daily-mission',
    }
  )
)
