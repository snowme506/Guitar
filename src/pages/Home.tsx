import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { courses } from '../data/courses'
import { useProgressStore } from '../stores/progressStore'
import { useDailyMissionStore } from '../stores/dailyMissionStore'
import TantanMascot from '../components/TantanMascot'

export default function Home() {
  const navigate = useNavigate()
  const totalStars = useProgressStore((s) => s.totalStars)
  const lessonProgress = useProgressStore((s) => s.lessons)
  const { todayMission, initializeDailyMission } = useDailyMissionStore()

  // Initialize daily mission on first load
  useEffect(() => {
    initializeDailyMission(courses.map(c => ({
      id: c.id,
      lessons: c.lessons.map(l => ({ id: l.id, title: l.title })),
    })))
  }, [])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return '早上好!'
    if (hour < 18) return '下午好!'
    return '晚上好!'
  }

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
              message={todayMission?.completed ? "太棒了！今天的任务全部完成！🎉" : getGreeting() + " 加油练习！"}
              size="sm"
            />
          </motion.div>
        </div>

        {/* 今日任务卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-3xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">🎯 今日任务</h2>
            <span className="text-white/80 text-sm">
              {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
            </span>
          </div>

          {/* 进度条 */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>今日进度</span>
              <span>{completedGoals} / {totalGoals} 课程</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-white rounded-full"
              />
            </div>
          </div>

          {/* 课程列表 */}
          <div className="space-y-3">
            {todayMission?.goals.map((goal) => {
              const isComplete = goal.currentCount >= goal.targetCount
              
              return (
                <motion.div
                  key={goal.lessonId}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/lesson/${goal.lessonId}`)}
                  className={`
                    flex items-center gap-3 p-3 rounded-2xl cursor-pointer
                    ${isComplete ? 'bg-white/20' : 'bg-white/10 hover:bg-white/30'}
                    transition-colors
                  `}
                >
                  <span className="text-2xl">{goal.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${isComplete ? 'line-through opacity-80' : ''}`}>
                        {goal.title}
                      </span>
                      {isComplete && <span className="text-lg">✅</span>}
                    </div>
                    <div className="text-sm text-white/70">
                      {goal.currentCount} / {goal.targetCount} 次
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: goal.targetCount }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${
                          i < goal.currentCount ? 'opacity-100' : 'opacity-30'
                        }`}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* 完成状态 */}
          {todayMission?.completed && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mt-4 text-center"
            >
              <div className="inline-block bg-white text-orange-500 px-6 py-2 rounded-full font-bold">
                🎉 今日任务全部完成！奖励 {todayMission.starReward} 星！
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* 已完成任务 */}
        {completedLessons.length > 0 && (
          <section>
            <h2 className="font-heading text-lg text-text mb-4">✅ 已完成任务</h2>
            <div className="grid grid-cols-2 gap-3">
              {completedLessons.slice(0, 6).map((lesson) => (
                <motion.div
                  key={lesson.lessonId}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/lesson/${lesson.lessonId}`)}
                  className="bg-green-50 rounded-2xl p-4 cursor-pointer hover:bg-green-100 transition-colors"
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

        {/* 空状态 - 没有已完成任务时 */}
        {completedLessons.length === 0 && (
          <section className="text-center py-8">
            <div className="text-4xl mb-3 opacity-50">📝</div>
            <p className="text-text-light">还没有完成任何课程</p>
            <p className="text-text-light text-sm">完成今日任务开始你的学习吧！</p>
          </section>
        )}
      </main>
    </div>
  )
}
