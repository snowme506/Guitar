import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { courses } from '../data/courses'
import type { Course } from '../data/types'
import SheetView from '../components/SheetView'
import SheetSearchWebView from '../components/SheetSearchWebView'
import { useMissionStore, type Mission } from '../stores/missionStore'
import { useProgressStore } from '../stores/progressStore'

export default function Admin() {
  const navigate = useNavigate()
  const [showSheetSearch, setShowSheetSearch] = useState(false)
  const [_editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [activeTab, setActiveTab] = useState<'courses' | 'missions'>('missions')
  const { missions, resetMissions, completeMission, startMission } = useMissionStore()
  const lessonProgress = useProgressStore((s) => s.lessons)

  // Build unified mission list with course info
  const unifiedMissions = missions.map(mission => {
    const course = courses.find(c => c.id === mission.courseId)
    const lesson = course?.lessons.find(l => l.id === mission.lessonId)
    const progress = lessonProgress[mission.lessonId]
    return {
      ...mission,
      courseName: course?.title || '',
      courseEmoji: course?.emoji || '',
      sheetNotes: lesson?.standardNotes || [],
      chordDiagram: lesson?.content?.chordDiagram,
      attempts: progress?.attempts || 0,
      bestScore: progress?.bestScore || 0,
    }
  })

  const getStatusColor = (status: Mission['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'inProgress': return 'bg-orange-100 text-orange-700'
      case 'available': return 'bg-yellow-100 text-yellow-700'
      case 'locked': return 'bg-gray-100 text-gray-500'
    }
  }

  const getStatusText = (status: Mission['status']) => {
    switch (status) {
      case 'completed': return '已完成'
      case 'inProgress': return '进行中'
      case 'available': return '可挑战'
      case 'locked': return '已锁定'
    }
  }

  // Group by course
  const missionsByCourse = unifiedMissions.reduce((acc, mission) => {
    if (!acc[mission.courseId]) {
      acc[mission.courseId] = {
        courseName: mission.courseName,
        courseEmoji: mission.courseEmoji,
        missions: []
      }
    }
    acc[mission.courseId].missions.push(mission)
    return acc
  }, {} as Record<string, { courseName: string; courseEmoji: string; missions: typeof unifiedMissions }>)

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
            onClick={() => setActiveTab('missions')}
            className={`
              flex-1 py-2 px-4 rounded-xl font-bold text-sm
              transition-all duration-200
              ${activeTab === 'missions'
                ? 'bg-primary text-white'
                : 'text-text hover:bg-surface2'
              }
            `}
          >
            🎯 任务中心
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
            📚 课程管理
          </button>
        </div>

        {activeTab === 'missions' ? (
        <>
        {/* 统一任务中心 */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg text-text">🎯 课程任务</h2>
            <button
              onClick={() => {
                if (confirm('确定要重置所有任务吗？这将清空所有进度。')) {
                  resetMissions()
                }
              }}
              className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-sm"
            >
              🔄 重置任务
            </button>
          </div>

          {/* 按课程分组显示 */}
          <div className="space-y-6">
            {Object.entries(missionsByCourse).map(([courseId, courseGroup]) => (
              <motion.div
                key={courseId}
                className="bg-surface rounded-2xl overflow-hidden shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* 课程标题 */}
                <div className="bg-gradient-to-r from-orange-400 to-orange-500 px-4 py-3 flex items-center gap-2">
                  <span className="text-2xl">{courseGroup.courseEmoji}</span>
                  <span className="font-bold text-white text-lg">{courseGroup.courseName}</span>
                  <span className="ml-auto text-white/80 text-sm">
                    {courseGroup.missions.filter(m => m.status === 'completed').length}/{courseGroup.missions.length} 完成
                  </span>
                </div>

                {/* 任务列表 */}
                <div className="divide-y divide-gray-100">
                  {courseGroup.missions.map((mission) => (
                    <div key={mission.id} className="p-4">
                      <div className="flex items-start gap-3">
                        {/* 状态图标 */}
                        <div className={`
                          w-12 h-12 rounded-xl flex items-center justify-center text-2xl
                          ${mission.status === 'completed' ? 'bg-green-100' : 
                            mission.status === 'locked' ? 'bg-gray-100' : 'bg-yellow-100'}
                        `}>
                          {mission.status === 'completed' ? '✅' : 
                           mission.status === 'locked' ? '🔒' : mission.emoji}
                        </div>

                        {/* 任务信息 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold text-text ${mission.status === 'locked' ? 'line-through text-gray-400' : ''}`}>
                              {mission.title}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(mission.status)}`}>
                              {getStatusText(mission.status)}
                            </span>
                          </div>

                          {/* 谱子信息 */}
                          {mission.chordDiagram && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                🎼 {mission.chordDiagram}
                              </span>
                            </div>
                          )}

                          {/* 练习统计 */}
                          <div className="flex items-center gap-4 text-sm text-text-light">
                            <span>📝 练习 {mission.attempts} 次</span>
                            {mission.bestScore > 0 && (
                              <span>🏆 最高分 {mission.bestScore}</span>
                            )}
                            <span>⭐ 奖励 {mission.starReward}星</span>
                          </div>

                          {/* 音符预览 */}
                          {mission.sheetNotes.length > 0 && (
                            <div className="mt-2 flex items-center gap-1">
                              {mission.sheetNotes.slice(0, 8).map((note, i) => (
                                <div
                                  key={i}
                                  className="w-6 h-8 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500"
                                >
                                  {note.fret}
                                </div>
                              ))}
                              {mission.sheetNotes.length > 8 && (
                                <span className="text-xs text-gray-400">...</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex flex-col gap-2">
                          {mission.status === 'locked' && (
                            <button
                              onClick={() => startMission(mission.id)}
                              className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium"
                            >
                              解锁
                            </button>
                          )}
                          {(mission.status === 'available' || mission.status === 'inProgress') && (
                            <>
                              <button
                                onClick={() => completeMission(mission.id)}
                                className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium"
                              >
                                完成
                              </button>
                              <button
                                onClick={() => navigate(`/lesson/${mission.lessonId}`)}
                                className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium"
                              >
                                练习
                              </button>
                            </>
                          )}
                          {mission.status === 'completed' && (
                            <button
                              onClick={() => navigate(`/lesson/${mission.lessonId}`)}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
                            >
                              回顾
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 总体统计 */}
        <section className="bg-surface rounded-2xl p-4 shadow">
          <h3 className="font-heading text-lg text-text mb-4">📊 学习统计</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-gray-100 rounded-xl p-3">
              <div className="text-2xl font-bold text-primary">{missions.length}</div>
              <div className="text-xs text-text-light">总任务</div>
            </div>
            <div className="bg-green-100 rounded-xl p-3">
              <div className="text-2xl font-bold text-green-600">
                {missions.filter(m => m.status === 'completed').length}
              </div>
              <div className="text-xs text-text-light">已完成</div>
            </div>
            <div className="bg-orange-100 rounded-xl p-3">
              <div className="text-2xl font-bold text-orange-600">
                {Object.values(lessonProgress).reduce((sum, p) => sum + (p?.attempts || 0), 0)}
              </div>
              <div className="text-xs text-text-light">总练习次数</div>
            </div>
            <div className="bg-yellow-100 rounded-xl p-3">
              <div className="text-2xl font-bold text-yellow-600">
                {Math.max(...Object.values(lessonProgress).map(p => p?.bestScore || 0))}
              </div>
              <div className="text-xs text-text-light">最高分</div>
            </div>
          </div>
        </section>
        </>
        ) : (
        <>
        {/* 课程列表 */}
        <section className="mb-8">
          <h2 className="font-heading text-lg text-text mb-4">📚 课程列表</h2>
          <div className="space-y-4">
            {courses.map(course => (
              <motion.div
                key={course.id}
                className="bg-surface rounded-2xl p-4 shadow"
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{course.emoji}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text">{course.title}</h3>
                    <p className="text-text-light text-sm">
                      {course.lessons.length} 课时
                    </p>
                  </div>
                  <button
                    className="px-4 py-2 bg-primary text-white rounded-xl text-sm"
                    onClick={() => setEditingCourse(course)}
                  >
                    编辑
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 添加新课程 */}
        <section>
          <h2 className="font-heading text-lg text-text mb-4">➕ 添加新课程</h2>
          <motion.div
            className="bg-surface rounded-2xl p-6 shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* 课程信息 */}
            <div className="mb-6">
              <label className="block text-text font-semibold mb-2">课程名称</label>
              <input
                type="text"
                placeholder="例如：入门课程"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* 谱子来源 */}
            <div className="mb-6">
              <label className="block text-text font-semibold mb-2">🎼 谱子</label>
              <SheetView 
                editable={true}
                onSheetChange={(sheet) => console.log('Sheet changed:', sheet)}
              />
              <button
                className="mt-2 w-full py-2 bg-secondary text-white rounded-xl"
                onClick={() => setShowSheetSearch(true)}
              >
                🔍 从网络搜索谱子
              </button>
            </div>

            {/* 提交按钮 */}
            <button className="w-full py-3 bg-primary text-white rounded-xl font-bold text-lg">
              保存课程
            </button>
          </motion.div>
        </section>
        </>
        )}
      </main>

      {/* WebView 搜索 */}
      <SheetSearchWebView
        isOpen={showSheetSearch}
        onClose={() => setShowSheetSearch(false)}
        onSelectSheet={(url) => {
          console.log('Selected sheet:', url)
        }}
      />
    </div>
  )
}
