import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { courses } from '../data/courses'
import { useProgressStore } from '../stores/progressStore'
import { useDailyMissionStore } from '../stores/dailyMissionStore'
import { useCourseConfigStore } from '../stores/courseConfigStore'
import TantanMascot from '../components/TantanMascot'

// 鲜艳的任务卡片颜色主题
const CARD_THEMES = [
  { bg: 'from-pink-400 to-rose-500', accent: 'bg-rose-100', text: 'text-rose-600' },
  { bg: 'from-violet-400 to-purple-500', accent: 'bg-violet-100', text: 'text-violet-600' },
  { bg: 'from-blue-400 to-cyan-500', accent: 'bg-blue-100', text: 'text-blue-600' },
  { bg: 'from-teal-400 to-emerald-500', accent: 'bg-teal-100', text: 'text-teal-600' },
  { bg: 'from-amber-400 to-orange-500', accent: 'bg-amber-100', text: 'text-amber-600' },
  { bg: 'from-red-400 to-pink-500', accent: 'bg-red-100', text: 'text-red-600' },
]

export default function Home() {
  const navigate = useNavigate()
  const totalStars = useProgressStore((s) => s.totalStars)
  const lessonProgress = useProgressStore((s) => s.lessons)
  const { todayMission, initializeDailyMission } = useDailyMissionStore()

  // Initialize daily mission on first load
  useEffect(() => {
    initializeDailyMission(
      courses.map(c => ({
        id: c.id,
        lessons: c.lessons.map(l => ({ id: l.id, title: l.title })),
      })),
      useCourseConfigStore.getState().lessonConfigs
    )
  }, [])

  const completedGoals = todayMission?.goals.filter(
    g => g.currentCount >= g.targetCount
  ).length ?? 0
  const totalGoals = todayMission?.goals.length ?? 0

  // Get all completed lessons
  const completedLessons = Object.entries(lessonProgress)
    .filter(([_, progress]) => progress?.completed)
    .map(([lessonId, progress]) => {
      const lesson = courses.flatMap(c => c.lessons).find(l => l.id === lessonId)
      return {
        lessonId,
        title: lesson?.title || '未知课程',
        bestScore: progress?.bestScore || 0,
        attempts: progress?.attempts || 0,
      }
    })

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 顶部导航 */}
      <header className="bg-surface shadow-sm sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🎸</span>
            <h1 className="font-heading text-2xl text-primary">Guitar乐园</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-surface2 px-3 py-1 rounded-full">
              <span className="text-xl">⭐</span>
              <span className="font-bold text-text">{totalStars}</span>
            </div>
            <button 
              className="w-10 h-10 rounded-full bg-surface2 flex items-center justify-center"
              onClick={() => navigate('/rewards')}
            >
              🏆
            </button>
            <button 
              className="w-10 h-10 rounded-full bg-surface2 flex items-center justify-center text-xl"
              onClick={() => navigate('/admin')}
            >
              ⚙️
            </button>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* 弹弹问候 */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <TantanMascot 
              state={todayMission?.completed ? "happy" : "idle"}
              message={todayMission?.completed ? "太棒了！今天任务完成！🎉" : "加油练习！💪"}
              size="md"
            />
          </motion.div>
        </div>

        {/* 今日任务标题 */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-text">🎯 今日任务</h2>
          <span className="text-sm text-text-light">
            {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
          </span>
        </div>

        {/* 进度概览 */}
        <div className="bg-surface rounded-2xl p-4 shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-text">今日进度</span>
            <span className="font-bold text-primary">{completedGoals} / {totalGoals}</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
            />
          </div>
        </div>

        {/* 任务卡片网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {todayMission?.goals.map((goal, index) => {
            const isComplete = goal.currentCount >= goal.targetCount
            const theme = CARD_THEMES[index % CARD_THEMES.length]
            
            return (
              <motion.div
                key={goal.lessonId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/lesson/${goal.lessonId}`)}
                className={`
                  relative overflow-hidden rounded-3xl p-5
                  bg-gradient-to-br ${theme.bg}
                  ${isComplete ? 'ring-4 ring-green-400' : 'shadow-lg hover:shadow-xl'}
                  cursor-pointer transition-all duration-300
                `}
              >
                {/* 完成标记 */}
                {isComplete && (
                  <div className="absolute top-3 right-3 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    ✓
                  </div>
                )}

                {/* 任务标题 */}
                <div className="mb-4">
                  <span className="text-4xl mb-2 block">{goal.emoji}</span>
                  <h3 className={`font-bold text-xl text-white ${isComplete ? 'opacity-80' : ''}`}>
                    {goal.title}
                  </h3>
                </div>

                {/* 练习进度 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-white/90 text-sm">
                    <span>练习进度</span>
                    <span className="font-bold">{goal.currentCount} / {goal.targetCount} 次</span>
                  </div>
                  <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (goal.currentCount / goal.targetCount) * 100)}%` }}
                      transition={{ duration: 0.3 }}
                      className="h-full bg-white rounded-full"
                    />
                  </div>
                </div>



                {/* 点击提示 */}
                <div className="mt-3 text-center">
                  <span className="text-white/80 text-sm">
                    {isComplete ? '✅ 已完成' : '点击开始练习 →'}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* 全部完成奖励 */}
        {todayMission?.completed && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-3xl p-6 text-white text-center shadow-lg"
          >
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="text-xl font-bold mb-2">太棒了！今日任务全部完成！</h3>
            <p className="text-white/90">奖励 {todayMission.starReward} 星！明天继续加油！</p>
          </motion.div>
        )}

        {/* 已完成任务 */}
        {completedLessons.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-text mb-4">✅ 已完成任务</h2>
            <div className="grid grid-cols-2 gap-3">
              {completedLessons.slice(0, 6).map((lesson) => (
                <motion.div
                  key={lesson.lessonId}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/lesson/${lesson.lessonId}`)}
                  className="bg-green-50 rounded-2xl p-4 cursor-pointer hover:bg-green-100 transition-colors border-2 border-green-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">✅</span>
                    <span className="font-medium text-text text-sm">{lesson.title}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-green-600">
                    <span>🏆 {lesson.bestScore}分</span>
                    <span>📝 {lesson.attempts}次</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* 空状态 */}
        {completedLessons.length === 0 && !todayMission?.goals.length && (
          <section className="text-center py-8">
            <div className="text-5xl mb-3 opacity-50">📝</div>
            <p className="text-text-light">还没有设置今日任务</p>
            <p className="text-text-light text-sm">去管理后台设置今日任务吧！</p>
          </section>
        )}
      </main>
    </div>
  )
}
