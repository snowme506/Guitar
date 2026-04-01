const API_BASE = 'http://101.201.181.170:3000'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
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

  // 每日任务
  getDailyMission: (date?: string) =>
    request<{ date: string; goals: any[]; completed: boolean; completedAt?: string; starReward: number } | null>(
      `/api/daily-mission?date=${date || new Date().toISOString().split('T')[0]}`
    ),

  saveDailyMission: (data: { date: string; goals: any[]; completed: boolean; completedAt?: string; starReward: number }) =>
    request(`/api/daily-mission`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  recordPractice: (lessonId: string, date?: string) =>
    request<{ success: boolean; goals: any[]; completed: boolean }>(
      `/api/daily-mission/record`,
      {
        method: 'POST',
        body: JSON.stringify({ lessonId, date: date || new Date().toISOString().split('T')[0] }),
      }
    ),

  // 学习进度
  getProgress: () =>
    request<{ totalStars: number; earnedBadges: string[]; outfits: string[]; lessons: Record<string, any> }>(
      `/api/progress`
    ),

  getLessonProgress: (lessonId: string) =>
    request<any | null>(`/api/progress/${lessonId}`),

  updateLessonProgress: (lessonId: string, data: { score?: number; stars?: number; completed?: boolean }) =>
    request(`/api/progress/${lessonId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  addStars: (count: number) =>
    request(`/api/progress/add-stars`, {
      method: 'POST',
      body: JSON.stringify({ count }),
    }),

  addBadge: (badgeId: string) =>
    request(`/api/progress/add-badge`, {
      method: 'POST',
      body: JSON.stringify({ badgeId }),
    }),

  unlockOutfit: (outfitId: string) =>
    request(`/api/progress/unlock-outfit`, {
      method: 'POST',
      body: JSON.stringify({ outfitId }),
    }),
}
