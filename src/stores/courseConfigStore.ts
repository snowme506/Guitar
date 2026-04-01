import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 课程配置覆盖（用户编辑后保存）
export interface LessonConfig {
  lessonId: string
  title?: string
  chordDiagram?: string
  sheetImageUrl?: string
  targetCount?: number  // 每日任务目标次数
  hidden?: boolean      // 是否隐藏（删除）
}

export interface CourseConfigStore {
  // 课程配置覆盖
  lessonConfigs: Record<string, LessonConfig>
  
  // Actions
  updateLessonConfig: (lessonId: string, config: Partial<LessonConfig>) => void
  getLessonConfig: (lessonId: string) => LessonConfig | undefined
  deleteLesson: (lessonId: string) => void
  deleteCourse: (courseId: string, lessonIds: string[]) => void
  resetLessonConfig: (lessonId: string) => void
  isLessonVisible: (lessonId: string) => boolean
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

      deleteLesson: (lessonId) => {
        set(state => ({
          lessonConfigs: {
            ...state.lessonConfigs,
            [lessonId]: {
              ...state.lessonConfigs[lessonId],
              lessonId,
              hidden: true,
            }
          }
        }))
      },

      deleteCourse: (_courseId, lessonIds: string[]) => {
        set(state => {
          const newConfigs = { ...state.lessonConfigs }
          lessonIds.forEach(id => {
            newConfigs[id] = {
              ...newConfigs[id],
              lessonId: id,
              hidden: true,
            }
          })
          return { lessonConfigs: newConfigs }
        })
      },

      resetLessonConfig: (lessonId) => {
        set(state => {
          const newConfigs = { ...state.lessonConfigs }
          delete newConfigs[lessonId]
          return { lessonConfigs: newConfigs }
        })
      },

      isLessonVisible: (lessonId) => {
        const config = get().lessonConfigs[lessonId]
        return !config?.hidden
      },
    }),
    {
      name: 'guitar-course-config',
    }
  )
)
