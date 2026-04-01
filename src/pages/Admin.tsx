import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { courses } from '../data/courses'
import { useDailyMissionStore } from '../stores/dailyMissionStore'
import { useCourseConfigStore, type LessonConfig } from '../stores/courseConfigStore'
import { useProgressStore } from '../stores/progressStore'

export default function Admin() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'daily' | 'courses'>('courses')
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<LessonConfig>>({})
  const [refreshKey, setRefreshKey] = useState(0)  // 用于强制刷新
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { todayMission, initializeDailyMission } = useDailyMissionStore()
  const { lessonConfigs, updateLessonConfig, deleteLesson, deleteCourse } = useCourseConfigStore()
  const lessonProgress = useProgressStore((s) => s.lessons)

  // 过滤掉隐藏的课程（响应式）
  const visibleCourses = courses
    .map(course => ({
      ...course,
      lessons: course.lessons.filter(lesson => {
        const config = lessonConfigs[lesson.id]
        return !config?.hidden
      })
    }))
    .filter(course => course.lessons.length > 0)

  // 获取课程配置（合并静态数据 + 用户编辑）
  const getLessonDisplay = (lessonId: string, defaultTitle: string) => {
    const config = lessonConfigs[lessonId]
    return {
      title: config?.title || defaultTitle,
      chordDiagram: config?.chordDiagram,
      sheetImageUrl: config?.sheetImageUrl,
    }
  }

  // 获取每日任务目标次数
  const getTargetCount = (lessonId: string) => {
    const config = lessonConfigs[lessonId]
    const dailyGoal = todayMission?.goals.find(g => g.lessonId === lessonId)
    return config?.targetCount || dailyGoal?.targetCount || 2
  }

  // 开始编辑
  const startEdit = (lessonId: string) => {
    const lesson = courses.flatMap(c => c.lessons).find(l => l.id === lessonId)
    const display = getLessonDisplay(lessonId, lesson?.title || '')
    const target = getTargetCount(lessonId)
    setEditForm({
      title: display.title,
      chordDiagram: display.chordDiagram || '',
      sheetImageUrl: display.sheetImageUrl || '',
      targetCount: target,
    })
    setEditingLessonId(lessonId)
  }

  // 保存编辑
  const saveEdit = () => {
    if (editingLessonId) {
      updateLessonConfig(editingLessonId, editForm)
      setEditingLessonId(null)
      setEditForm({})
      // 强制刷新以确保显示最新数据
      setRefreshKey(k => k + 1)
    }
  }

  // 取消编辑
  const cancelEdit = () => {
    setEditingLessonId(null)
    setEditForm({})
  }

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setEditForm(prev => ({ ...prev, sheetImageUrl: url }))
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 顶部导航 */}
      <header className="bg-surface shadow-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            className="w-10 h-10 rounded-full bg-surface2 flex items-center justify-center text-xl"
            onClick={() => navigate('/')}
          >
            ←
          </button>
          <h1 className="font-heading text-xl text-text">⚙️ 管理后台</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* 切换标签 */}
        <div className="flex gap-2 p-1 bg-surface rounded-2xl mb-6">
          <button
            onClick={() => setActiveTab('daily')}
            className={`
              flex-1 py-2 px-4 rounded-xl font-bold text-sm
              transition-all duration-200
              ${activeTab === 'daily'
                ? 'bg-primary text-white'
                : 'text-text hover:bg-surface2'
              }
            `}
          >
            🎯 今日任务
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`
              flex-1 py-2 px-4 rounded-xl font-bold text-sm
              transition-all duration-200
              ${activeTab === 'courses'
                ? 'bg-primary text-white'
                : 'text-text hover:bg-surface2'
              }
            `}
          >
            📚 课程编辑
          </button>
        </div>

        {activeTab === 'daily' ? (
        <>
        {/* 今日任务管理 */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg text-text">🎯 今日任务</h2>
            <button
              onClick={() => {
                initializeDailyMission(
                  visibleCourses.map(c => ({
                    id: c.id,
                    lessons: c.lessons.map(l => ({ id: l.id, title: l.title })),
                  })),
                  lessonConfigs
                )
              }}
              className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-sm"
            >
              🔄 重新初始化
            </button>
          </div>

          <div className="bg-surface rounded-2xl overflow-hidden shadow">
            <div className="px-4 py-3 bg-orange-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-text">📅 {todayMission?.date || '未设置'}</h3>
                  <p className="text-text-light text-sm">
                    {todayMission?.goals.length || 0} 个课程 | 奖励 {todayMission?.starReward || 0} 星
                  </p>
                </div>
                {todayMission?.completed && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                    ✅ 已完成
                  </span>
                )}
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {todayMission?.goals.map((goal) => {
                const display = getLessonDisplay(goal.lessonId, goal.title)
                return (
                  <div key={goal.lessonId} className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎸</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-text">{display.title}</span>
                          {goal.currentCount >= goal.targetCount && (
                            <span className="text-green-500">✅</span>
                          )}
                        </div>
                        <div className="text-sm text-text-light">
                          目标: {goal.targetCount} 次 | 当前: {goal.currentCount} 次
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/lesson/${goal.lessonId}`)}
                        className="px-3 py-1 bg-orange-100 text-orange-600 rounded-lg text-sm"
                      >
                        练习
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
        </>
        ) : (
        <>
        {/* 课程编辑 */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg text-text">📚 课程内容编辑</h2>
            <span className="text-sm text-text-light">点击编辑/删除按钮管理课程</span>
          </div>

          <div className="space-y-4" key={refreshKey}>
            {visibleCourses.map((course) => (
              <motion.div
                key={course.id}
                className="bg-surface rounded-2xl overflow-hidden shadow"
              >
                {/* 课程头部 */}
                <div className="px-4 py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{course.emoji}</span>
                    <span className="font-bold">{course.title}</span>
                    <span className="ml-auto text-white/80 text-sm">
                      {course.lessons.length} 课时
                    </span>
                    <button
                      onClick={() => {
                        if (confirm(`确定要删除"${course.title}"课程吗？`)) {
                          deleteCourse(course.id, course.lessons.map(l => l.id))
                          setRefreshKey(k => k + 1)
                        }
                      }}
                      className="px-2 py-1 bg-red-500 hover:bg-red-600 rounded text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* 课程列表 */}
                <div className="divide-y divide-gray-100">
                  {course.lessons.map((lesson, index) => {
                    const progress = lessonProgress[lesson.id]
                    const display = getLessonDisplay(lesson.id, lesson.title)
                    const targetCount = getTargetCount(lesson.id)
                    const isEditing = editingLessonId === lesson.id

                    return (
                      <div key={lesson.id} className="p-4">
                        {isEditing ? (
                          /* 编辑模式 */
                          <div className="space-y-4">
                            <div>
                              <label className="block text-text font-medium mb-1">课程名称</label>
                              <input
                                type="text"
                                value={editForm.title || ''}
                                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </div>

                            <div>
                              <label className="block text-text font-medium mb-1">和弦/内容</label>
                              <input
                                type="text"
                                value={editForm.chordDiagram || ''}
                                onChange={(e) => setEditForm(prev => ({ ...prev, chordDiagram: e.target.value }))}
                                placeholder="例如：C - Am - F - G"
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </div>

                            <div>
                              <label className="block text-text font-medium mb-1">每日目标次数</label>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => setEditForm(prev => ({ 
                                    ...prev, 
                                    targetCount: Math.max(1, (prev.targetCount || 2) - 1) 
                                  }))}
                                  className="w-10 h-10 bg-gray-100 rounded-xl text-xl hover:bg-gray-200"
                                >
                                  -
                                </button>
                                <span className="text-2xl font-bold text-primary w-12 text-center">
                                  {editForm.targetCount || 2}
                                </span>
                                <button
                                  onClick={() => setEditForm(prev => ({ 
                                    ...prev, 
                                    targetCount: Math.min(10, (prev.targetCount || 2) + 1) 
                                  }))}
                                  className="w-10 h-10 bg-gray-100 rounded-xl text-xl hover:bg-gray-200"
                                >
                                  +
                                </button>
                                <span className="text-text-light text-sm ml-2">次/天</span>
                              </div>
                            </div>

                            <div>
                              <label className="block text-text font-medium mb-1">谱子图片</label>
                              {editForm.sheetImageUrl && (
                                <img
                                  src={editForm.sheetImageUrl}
                                  alt="谱子预览"
                                  className="w-full h-32 object-contain bg-gray-100 rounded-xl mb-2"
                                />
                              )}
                              <div className="flex gap-2">
                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  className="hidden"
                                />
                                <button
                                  onClick={() => fileInputRef.current?.click()}
                                  className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm"
                                >
                                  📷 上传图片
                                </button>
                                {editForm.sheetImageUrl && (
                                  <button
                                    onClick={() => setEditForm(prev => ({ ...prev, sheetImageUrl: '' }))}
                                    className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm"
                                  >
                                    🗑️ 删除
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                              <button
                                onClick={cancelEdit}
                                className="flex-1 px-4 py-2 bg-gray-100 text-text rounded-xl"
                              >
                                取消
                              </button>
                              <button
                                onClick={saveEdit}
                                className="flex-1 px-4 py-2 bg-primary text-white rounded-xl font-bold"
                              >
                                保存
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* 查看模式 */
                          <div className="flex items-start gap-3">
                            <span className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-text">{display.title}</span>
                                {progress?.completed && (
                                  <span className="text-green-500 text-sm">✅ 已完成</span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                {display.chordDiagram && (
                                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                                    🎸 {display.chordDiagram}
                                  </span>
                                )}
                                <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded">
                                  🎯 每日 {targetCount} 次
                                </span>
                                {display.sheetImageUrl && (
                                  <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded">
                                    🖼️ 有谱子
                                  </span>
                                )}
                                {progress && (
                                  <span className="text-xs text-text-light">
                                    📝 {progress.attempts}次 | 🏆 {progress.bestScore}分
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEdit(lesson.id)}
                                className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-sm"
                              >
                                ✏️ 编辑
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`确定要删除"${display.title}"这个课程吗？`)) {
                                    deleteLesson(lesson.id)
                                    setRefreshKey(k => k + 1)
                                  }
                                }}
                                className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 统计 */}
        <section className="bg-surface rounded-2xl p-4 shadow">
          <h3 className="font-heading text-lg text-text mb-4">📊 学习统计</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-gray-100 rounded-xl p-3">
              <div className="text-2xl font-bold text-primary">
                {visibleCourses.reduce((sum, c) => sum + c.lessons.length, 0)}
              </div>
              <div className="text-xs text-text-light">总课时</div>
            </div>
            <div className="bg-green-100 rounded-xl p-3">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(lessonProgress).filter(p => p?.completed).length}
              </div>
              <div className="text-xs text-text-light">已完成</div>
            </div>
            <div className="bg-orange-100 rounded-xl p-3">
              <div className="text-2xl font-bold text-orange-600">
                {Object.values(lessonProgress).reduce((sum, p) => sum + (p?.attempts || 0), 0)}
              </div>
              <div className="text-xs text-text-light">总练习</div>
            </div>
            <div className="bg-yellow-100 rounded-xl p-3">
              <div className="text-2xl font-bold text-yellow-600">
                {Math.max(0, ...Object.values(lessonProgress).map(p => p?.bestScore || 0))}
              </div>
              <div className="text-xs text-text-light">最高分</div>
            </div>
          </div>
        </section>
        </>
        )}
      </main>
    </div>
  )
}
