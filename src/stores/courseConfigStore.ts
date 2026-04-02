import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../lib/api'

// 课程配置
export interface LessonConfig {
  lessonId: string
  title?: string
  chordDiagram?: string
  sheetImageData?: string
  sheetImageUrl?: string
  targetCount?: number
  hidden?: boolean
}

interface CourseConfigState {
  lessonConfigs: Record<string, LessonConfig>
  loading: boolean
}

interface CourseConfigActions {
  updateLessonConfig: (lessonId: string, config: Partial<LessonConfig>) => Promise<void>
  getLessonConfig: (lessonId: string) => LessonConfig | undefined
  deleteLesson: (lessonId: string) => Promise<void>
  deleteCourse: (courseId: string, lessonIds: string[]) => Promise<void>
  resetLessonConfig: (lessonId: string) => Promise<void>
  isLessonVisible: (lessonId: string) => boolean
  refreshConfigs: () => Promise<void>
}

type CourseConfigStore = CourseConfigState & CourseConfigActions

export const useCourseConfigStore = create<CourseConfigStore>()(
  persist(
    (set, get) => ({
      lessonConfigs: {},
      loading: false,

      refreshConfigs: async () => {
        try {
          const data = await api.getAllLessonConfigs()
          set({ lessonConfigs: data || {}, loading: false })
        } catch {
          set({ loading: false })
        }
      },

      updateLessonConfig: async (lessonId, config) => {
        // 先更新本地状态
        set(state => ({
          lessonConfigs: {
            ...state.lessonConfigs,
            [lessonId]: {
              ...state.lessonConfigs[lessonId],
              lessonId,
              ...config,
            },
          },
        }))
        // 再同步到存储
        try {
          await api.updateLessonConfig(lessonId, config)
        } catch (e) {
          console.error('Failed to update config:', e)
        }
      },

      getLessonConfig: (lessonId) => {
        return get().lessonConfigs[lessonId]
      },

      deleteLesson: async (lessonId) => {
        // 先更新本地状态
        set(state => ({
          lessonConfigs: {
            ...state.lessonConfigs,
            [lessonId]: {
              ...state.lessonConfigs[lessonId],
              lessonId,
              hidden: true,
            },
          },
        }))
        try {
          await api.deleteLessonConfig(lessonId)
        } catch (e) {
          console.error('Failed to delete lesson:', e)
        }
      },

      deleteCourse: async (_courseId, lessonIds) => {
        // 先更新本地状态
        set(state => {
          const configs = { ...state.lessonConfigs }
          lessonIds.forEach(id => {
            configs[id] = { ...configs[id], lessonId: id, hidden: true }
          })
          return { lessonConfigs: configs }
        })
        try {
          for (const id of lessonIds) {
            await api.deleteLessonConfig(id)
          }
        } catch (e) {
          console.error('Failed to delete course:', e)
        }
      },

      resetLessonConfig: async (lessonId) => {
        // 先更新本地状态
        set(state => {
          const configs = { ...state.lessonConfigs }
          delete configs[lessonId]
          return { lessonConfigs: configs }
        })
        try {
          await api.deleteLessonConfig(lessonId)
        } catch (e) {
          console.error('Failed to reset config:', e)
        }
      },

      isLessonVisible: (lessonId) => {
        const config = get().lessonConfigs[lessonId]
        return !config?.hidden
      },
    }),
    {
      name: 'guitar-course-configs',
    }
  )
)
