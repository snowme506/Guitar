import { create } from 'zustand'

// 课程配置
export interface LessonConfig {
  lessonId: string
  title?: string
  chordDiagram?: string
  sheetImageUrl?: string
  targetCount?: number
  hidden?: boolean
}

// 直接使用 localStorage，确保数据持久化
const STORAGE_KEY = 'guitar-course-config'

// 从 localStorage 读取配置
function loadConfigs(): Record<string, LessonConfig> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

// 保存配置到 localStorage
function saveConfigs(configs: Record<string, LessonConfig>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs))
  } catch (e) {
    console.error('Failed to save course configs:', e)
  }
}

export const useCourseConfigStore = create<{
  lessonConfigs: Record<string, LessonConfig>
  updateLessonConfig: (lessonId: string, config: Partial<LessonConfig>) => void
  getLessonConfig: (lessonId: string) => LessonConfig | undefined
  deleteLesson: (lessonId: string) => void
  deleteCourse: (courseId: string, lessonIds: string[]) => void
  resetLessonConfig: (lessonId: string) => void
  isLessonVisible: (lessonId: string) => boolean
  refreshConfigs: () => void
}>((set, get) => ({
  lessonConfigs: loadConfigs(),

  updateLessonConfig: (lessonId, config) => {
    const configs = { ...get().lessonConfigs }
    configs[lessonId] = {
      ...configs[lessonId],
      lessonId,
      ...config,
    }
    saveConfigs(configs)
    set({ lessonConfigs: configs })
  },

  getLessonConfig: (lessonId) => {
    return get().lessonConfigs[lessonId]
  },

  deleteLesson: (lessonId) => {
    const configs = { ...get().lessonConfigs }
    configs[lessonId] = {
      ...configs[lessonId],
      lessonId,
      hidden: true,
    }
    saveConfigs(configs)
    set({ lessonConfigs: configs })
  },

  deleteCourse: (_courseId, lessonIds) => {
    const configs = { ...get().lessonConfigs }
    lessonIds.forEach(id => {
      configs[id] = {
        ...configs[id],
        lessonId: id,
        hidden: true,
      }
    })
    saveConfigs(configs)
    set({ lessonConfigs: configs })
  },

  resetLessonConfig: (lessonId) => {
    const configs = { ...get().lessonConfigs }
    delete configs[lessonId]
    saveConfigs(configs)
    set({ lessonConfigs: configs })
  },

  isLessonVisible: (lessonId) => {
    const config = get().lessonConfigs[lessonId]
    return !config?.hidden
  },

  // 强制从 localStorage 刷新配置
  refreshConfigs: () => {
    set({ lessonConfigs: loadConfigs() })
  },
}))
