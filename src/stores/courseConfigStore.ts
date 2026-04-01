import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 课程配置覆盖（用户编辑后保存）
export interface LessonConfig {
  lessonId: string
  title?: string
  chordDiagram?: string
  sheetImageUrl?: string
  targetCount?: number  // 每日任务目标次数
}

export interface CourseConfigStore {
  // 课程配置覆盖
  lessonConfigs: Record<string, LessonConfig>
  
  // Actions
  updateLessonConfig: (lessonId: string, config: Partial<LessonConfig>) => void
  getLessonConfig: (lessonId: string) => LessonConfig | undefined
  resetLessonConfig: (lessonId: string) => void
}

export const useCourseConfigStore = create<CourseConfigStore>()(
  persist(
    (set, get) => ({
      lessonConfigs: {},

      updateLessonConfig: (lessonId, config) => {
        set(state => ({
          lessonConfigs: {
            ...state.lessonConfigs,
            [lessonId]: {
              ...state.lessonConfigs[lessonId],
              lessonId,
              ...config,
            }
          }
        }))
      },

      getLessonConfig: (lessonId) => {
        return get().lessonConfigs[lessonId]
      },

      resetLessonConfig: (lessonId) => {
        set(state => {
          const newConfigs = { ...state.lessonConfigs }
          delete newConfigs[lessonId]
          return { lessonConfigs: newConfigs }
        })
      },
    }),
    {
      name: 'guitar-course-config',
    }
  )
)
