// 本地存储 API - 不需要后端
const STORAGE_KEY = 'guitar-lesson-configs'

function getStoredConfigs() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

function saveConfigs(configs: Record<string, any>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs))
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  // 如果是写操作，更新 localStorage
  if (options?.method === 'POST' || options?.method === 'DELETE') {
    const configs = getStoredConfigs()
    const match = path.match(/\/api\/lessons\/([^/]+)/)
    const lessonId = match ? match[1] : null
    
    if (options.method === 'DELETE' && lessonId) {
      // 删除：将 hidden 设为 true
      configs[lessonId] = { ...configs[lessonId], lessonId, hidden: true }
      saveConfigs(configs)
    } else if (options.method === 'POST' && lessonId) {
      // 更新：合并配置
      const body = JSON.parse(options.body as string)
      configs[lessonId] = { ...configs[lessonId], lessonId, ...body }
      saveConfigs(configs)
    }
  }
  
  // 读操作从 localStorage 读取
  if (path.startsWith('/api/lessons')) {
    if (path === '/api/lessons' || path === '/api/lessons/config') {
      return getStoredConfigs() as T
    }
    const match = path.match(/\/api\/lessons\/([^/]+)/)
    const lessonId = match ? match[1] : null
    if (lessonId) {
      const configs = getStoredConfigs()
      return (configs[lessonId] || null) as T
    }
  }
  
  return {} as T
}

export const api = {
  // 课程配置
  getLessonConfig: (lessonId: string) =>
    request<{ lessonId: string; title?: string; chordDiagram?: string; sheetImageData?: string; targetCount?: number; hidden?: boolean } | null>(
      `/api/lessons/${lessonId}/config`
    ),

  getAllLessonConfigs: () =>
    request<Record<string, any>>(`/api/lessons`),

  updateLessonConfig: (lessonId: string, data: {
    title?: string
    chordDiagram?: string
    sheetImageData?: string
    targetCount?: number
    hidden?: boolean
  }) =>
    request(`/api/lessons/${lessonId}/config`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteLessonConfig: (lessonId: string) =>
    request(`/api/lessons/${lessonId}/config`, { method: 'DELETE' }),

  // 每日任务 - 暂时用 localStorage
  getDailyMission: () => {
    const data = localStorage.getItem('guitar-daily-mission')
    return Promise.resolve(data ? JSON.parse(data) : null)
  },

  saveDailyMission: (data: any) => {
    localStorage.setItem('guitar-daily-mission', JSON.stringify(data))
    return Promise.resolve()
  },

  recordPractice: () => {
    // 简化实现
    return Promise.resolve({ success: true, goals: [], completed: false })
  },

  // 学习进度 - localStorage
  getProgress: () => {
    const data = localStorage.getItem('guitar-progress')
    return Promise.resolve(data ? JSON.parse(data) : { totalStars: 0, earnedBadges: [], outfits: [], lessons: {} })
  },

  getLessonProgress: (lessonId: string) => {
    const data = localStorage.getItem('guitar-progress')
    const progress = data ? JSON.parse(data) : {}
    return Promise.resolve(progress.lessons?.[lessonId] || null)
  },

  updateLessonProgress: () => Promise.resolve(),
  addStars: () => Promise.resolve(),
  addBadge: () => Promise.resolve(),
  unlockOutfit: () => Promise.resolve(),
}
