import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { courses } from '../data/courses'
import { useDailyMissionStore } from '../stores/dailyMissionStore'
import { useProgressStore } from '../stores/progressStore'

export default function Admin() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'daily' | 'courses'>('daily')
  const { todayMission, initializeDailyMission } = useDailyMissionStore()
  const lessonProgress = useProgressStore((s) => s.lessons)

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
            📚 课程体系
          </button>
        </div>

        {activeTab === 'daily' ? (
        <>
        {/* 今日任务管理 */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg text-text">🎯 今日任务设置</h2>
            <button
              onClick={() => {
                initializeDailyMission(courses.map(c => ({
                  id: c.id,
                  lessons: c.lessons.map(l => ({ id: l.id, title: l.title })),
                })))
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
                    计划 {todayMission?.goals.length || 0} 个课程，奖励 {todayMission?.starReward || 0} 星
                  </p>
                </div>
                {todayMission?.completed && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                    ✅ 已完成
                  </span>
                )}
              </div>
            </div>

            {/* 课程目标列表 */}
            <div className="divide-y divide-gray-100">
              {todayMission?.goals.map((goal) => {
                const isComplete = goal.currentCount >= goal.targetCount
                
                return (
                  <div key={goal.lessonId} className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{goal.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-text">{goal.title}</span>
                          {isComplete && <span className="text-green-500">✅</span>}
                        </div>
                        <div className="text-sm text-text-light">
                          目标: {goal.targetCount} 次 | 当前: {goal.currentCount} 次
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: goal.targetCount }).map((_, i) => (
                          <span
                            key={i}
                            className={`text-lg ${i < goal.currentCount ? 'opacity-100' : 'opacity-30'}`}
                          >
                            ⭐
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 空状态 */}
            {!todayMission?.goals.length && (
              <div className="p-8 text-center">
                <p className="text-4xl mb-4">📅</p>
                <p className="text-text">今日任务未初始化</p>
                <button
                  onClick={() => {
                    initializeDailyMission(courses.map(c => ({
                      id: c.id,
                      lessons: c.lessons.map(l => ({ id: l.id, title: l.title })),
                    })))
                  }}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded-xl"
                >
                  点击初始化
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 提示 */}
        <div className="bg-blue-50 rounded-2xl p-4">
          <h3 className="font-bold text-blue-800 mb-2">💡 说明</h3>
          <ul className="text-blue-600 text-sm space-y-1">
            <li>• 每次练习会记录一次练习次数</li>
            <li>• 达到目标次数后，该课程显示"已完成"</li>
            <li>• 所有课程都完成 = 今日任务完成</li>
            <li>• 每天会自动重置新的今日任务</li>
          </ul>
        </div>
        </>
        ) : (
        <>
        {/* 课程体系管理 */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg text-text">📚 课程列表</h2>
            <button
              onClick={() => {
                alert('添加课程功能开发中...')
              }}
              className="px-3 py-1 bg-primary text-white rounded-lg text-sm"
            >
              ➕ 添加课程
            </button>
          </div>

          <div className="space-y-4">
            {courses.map((course) => (
              <motion.div
                key={course.id}
                className="bg-surface rounded-2xl overflow-hidden shadow"
              >
                {/* 课程头部 */}
                <div className="px-4 py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{course.emoji}</span>
                    <div className="flex-1">
                      <span className="font-bold">{course.title}</span>
                      <span className="ml-2 text-white/80 text-sm">
                        {course.lessons.length} 课时
                      </span>
                    </div>
                    <button
                      onClick={() => alert('编辑课程功能开发中...')}
                      className="px-2 py-1 bg-white/20 rounded text-sm hover:bg-white/30"
                    >
                      ✏️ 编辑
                    </button>
                  </div>
                </div>

                {/* 课时列表 */}
                <div className="divide-y divide-gray-100">
                  {course.lessons.map((lesson, lessonIndex) => {
                    const progress = lessonProgress[lesson.id]
                    return (
                      <div key={lesson.id} className="px-4 py-3 flex items-center gap-3">
                        <span className="text-lg font-medium text-text-light">
                          {lessonIndex + 1}
                        </span>
                        <div className="flex-1">
                          <span className="font-medium text-text">{lesson.title}</span>
                          {progress && (
                            <div className="text-xs text-text-light mt-0.5">
                              练习 {progress.attempts} 次 | 最高 {progress.bestScore} 分
                              {progress.completed && <span className="text-green-500 ml-2">✅</span>}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {lesson.content?.chordDiagram && (
                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                              🎸 {lesson.content.chordDiagram}
                            </span>
                          )}
                          {lesson.standardNotes && lesson.standardNotes.length > 0 && (
                            <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded">
                              🎵 {lesson.standardNotes.length} 音符
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => navigate(`/lesson/${lesson.id}`)}
                          className="px-3 py-1 bg-orange-100 text-orange-600 rounded-lg text-sm"
                        >
                          练习
                        </button>
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
                {courses.reduce((sum, c) => sum + c.lessons.length, 0)}
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
              <div className="text-xs text-text-light">总练习次数</div>
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
