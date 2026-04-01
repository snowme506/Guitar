import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDailyMissionStore } from '../stores/dailyMissionStore'
import { useCourseConfigStore } from '../stores/courseConfigStore'
import { useProgressStore } from '../stores/progressStore'
import TantanMascot from '../components/TantanMascot'

export default function Practice() {
  const navigate = useNavigate()
  const { todayMission } = useDailyMissionStore()
  const courseConfigs = useCourseConfigStore((s) => s.lessonConfigs)
  const lessonProgress = useProgressStore((s) => s.lessons)

  const completedCount = todayMission?.goals.filter(
    g => g.currentCount >= g.targetCount
  ).length ?? 0
  const totalCount = todayMission?.goals.length ?? 0

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 顶部导航 */}
      <header className="bg-surface shadow-sm sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            className="w-10 h-10 rounded-full bg-surface2 flex items-center justify-center text-xl"
            onClick={() => navigate('/')}
          >
            ←
          </button>
          <h1 className="font-heading text-xl text-text">🎯 今日练习</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* 弹弹问候 */}
        <div className="text-center">
          <TantanMascot 
            state={completedCount === totalCount && totalCount > 0 ? "happy" : "idle"}
            message={completedCount === totalCount && totalCount > 0 ? "今天全部完成啦！🎉" : "今天要练习这些课程！"}
            size="sm"
          />
        </div>

        {/* 进度概览 */}
        <div className="bg-surface rounded-2xl p-4 shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-text font-medium">今日进度</span>
            <span className="font-bold text-primary">{completedCount} / {totalCount}</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
            />
          </div>
        </div>

        {/* 课程列表 */}
        <section>
          <h2 className="text-lg font-bold text-text mb-4">📚 今日课程</h2>
          <div className="space-y-4">
            {todayMission?.goals.map((goal, index) => {
              const isComplete = goal.currentCount >= goal.targetCount
              const progress = lessonProgress[goal.lessonId]
              const config = courseConfigs[goal.lessonId]
              const title = config?.title || goal.title
              const sheetImage = config?.sheetImageUrl

              return (
                <motion.div
                  key={goal.lessonId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => navigate(`/lesson/${goal.lessonId}`)}
                  className={`
                    bg-surface rounded-2xl overflow-hidden shadow
                    cursor-pointer hover:shadow-lg transition-all
                    ${isComplete ? 'ring-2 ring-green-400' : ''}
                  `}
                >
                  {/* 课程头部 */}
                  <div className={`
                    px-4 py-3 flex items-center gap-3
                    ${isComplete ? 'bg-green-50' : 'bg-orange-50'}
                  `}>
                    <span className="text-3xl">{isComplete ? '✅' : '🎸'}</span>
                    <div className="flex-1">
                      <h3 className={`font-bold text-lg ${isComplete ? 'text-green-700 line-through' : 'text-text'}`}>
                        {title}
                      </h3>
                      <p className="text-sm text-text-light">
                        {goal.currentCount} / {goal.targetCount} 次 · 
                        最高分 {progress?.bestScore || 0}
                      </p>
                    </div>
                    <div className="text-2xl">→</div>
                  </div>

                  {/* 谱子图片 */}
                  {sheetImage && (
                    <div className="px-4 pb-3">
                      <img 
                        src={sheetImage} 
                        alt="谱子" 
                        className="w-full h-24 object-contain bg-gray-50 rounded-xl"
                      />
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* 空状态 */}
        {!todayMission?.goals.length && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📝</div>
            <p className="text-text-light">今天还没有设置练习课程</p>
            <button
              onClick={() => navigate('/admin')}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-xl"
            >
              去管理后台设置
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
