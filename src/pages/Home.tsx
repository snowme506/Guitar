import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { courses } from '../data/courses'
import { useProgressStore } from '../stores/progressStore'
import TantanMascot from '../components/TantanMascot'
import CourseCard from '../components/CourseCard'

export default function Home() {
  const navigate = useNavigate()
  const totalStars = useProgressStore((s) => s.totalStars)

  const todayGoal = 1 // 每天1课
  const todayCompleted = Object.values(useProgressStore.getState().lessons)
    .filter(l => {
      if (!l.lastPlayed) return false
      const today = new Date().toDateString()
      return new Date(l.lastPlayed).toDateString() === today
    }).length

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
              className="w-10 h-10 rounded-full bg-surface2 flex items-center justify-center text-sm"
              onClick={() => navigate('/admin')}
              title="家长入口"
            >
              ⚙️
            </button>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* 弹弹欢迎 */}
        <motion.div
          className="bg-surface rounded-2xl p-6 shadow-lg mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex items-center gap-4">
            <TantanMascot state="idle" size="lg" />
            <div>
              <p className="font-heading text-xl text-text mb-1">
                "今天想学什么呀？"
              </p>
              <p className="text-text-light text-sm">
                点击课程开始学习吧！🎸
              </p>
            </div>
          </div>
        </motion.div>

        {/* 今日目标 */}
        <motion.div
          className="bg-gradient-to-r from-primary to-highlight rounded-2xl p-4 mb-6 text-white"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold">🎯 今日目标</p>
              <p className="text-sm opacity-90">
                {todayCompleted >= todayGoal 
                  ? '太棒了！今天的目标完成了！' 
                  : `再学${todayGoal - todayCompleted}课就能达成！`}
              </p>
            </div>
            <div className="text-3xl">
              {todayCompleted >= todayGoal ? '🏆' : '⭐'}
            </div>
          </div>
        </motion.div>

        {/* 课程列表 */}
        <section>
          <h2 className="font-heading text-xl text-text mb-4">📚 课程</h2>
          <div className="space-y-4">
            {courses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * (i + 1) }}
              >
                <CourseCard
                  course={course}
                  onClick={() => {
                    // TODO: 进入课程详情或直接选课时
                    navigate(`/lesson/${course.lessons[0]?.id}`)
                  }}
                />
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
