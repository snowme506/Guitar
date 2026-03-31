import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { courses } from '../data/courses'
import { useProgressStore } from '../stores/progressStore'
import TantanMascot from '../components/TantanMascot'
import StarDisplay from '../components/StarDisplay'

export default function Home() {
  const navigate = useNavigate()
  const totalStars = useProgressStore((s) => s.totalStars)
  const courseProgress = useProgressStore((s) => s.courses)

  // 计算进度
  const totalCourses = courses.length
  const completedCourses = Object.values(courseProgress).filter(c => c.completed).length
  const progressPercent = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎸</span>
          <h1 className="text-2xl font-bold text-text">Guitar乐园</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <motion.div
            className="flex items-center gap-2 bg-warning/20 px-4 py-2 rounded-full"
            whileHover={{ scale: 1.05 }}
          >
            <StarDisplay count={totalStars} size="sm" />
          </motion.div>
          
          <motion.button
            onClick={() => navigate('/admin')}
            className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-md"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="家长入口"
          >
            <span className="text-2xl">⚙️</span>
          </motion.button>
        </div>
      </header>

      {/* Main Content - Two Column Layout */}
      <main className="px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          
          {/* Left Sidebar - Tantan & Progress */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="lg:sticky lg:top-28 space-y-6">
              
              {/* Tantan Section */}
              <motion.section
                className="bg-white rounded-3xl p-6 shadow-lg text-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <TantanMascot message="今天想学什么呀？" size="md" />
                
                {/* Quick Stats */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-text-light">我的星星</span>
                    <span className="font-bold text-warning text-xl">{totalStars} ⭐</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-text-light">课程数</span>
                    <span className="font-bold text-success text-xl">{completedCourses}/{totalCourses}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-text-light">总进度</span>
                    <span className="font-bold text-primary text-xl">{progressPercent}%</span>
                  </div>
                </div>
              </motion.section>

              {/* Progress Bar */}
              <motion.div
                className="bg-gradient-to-r from-primary to-highlight rounded-3xl p-5 text-white shadow-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Trophy size={20} />
                  <span className="font-bold">学习进度</span>
                </div>
                <div className="bg-white/30 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="h-full bg-white rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  />
                </div>
                <p className="text-white/80 text-sm mt-2">
                  {progressPercent >= 100 ? '🎉 太棒了！全部完成！' : '继续加油！每课都有星星奖励！'}
                </p>
              </motion.div>

              {/* Tips Card */}
              <motion.div
                className="bg-surface2 rounded-3xl p-5"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="font-bold text-text mb-2 flex items-center gap-2">
                  <span>💡</span> 弹弹提示
                </h3>
                <p className="text-text-light text-sm">
                  每天练习10分钟，比周末练2小时效果更好哦！坚持就是胜利！✨
                </p>
              </motion.div>

            </div>
          </aside>

          {/* Right Content - Course Grid */}
          <section className="flex-1">
            <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
              <span>📚</span> 课程列表
            </h2>
            
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {courses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <div
                      className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                      onClick={() => navigate(`/lesson/${course.id}`)}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-4xl">{course.emoji}</span>
                        <div className="flex-1">
                          <h3 className="font-bold text-text">{course.title}</h3>
                          <p className="text-text-light text-sm">📅 {course.date}</p>
                        </div>
                      </div>
                      
                      {/* 进度指示 */}
                      <div className="flex items-center gap-2">
                        {courseProgress[course.id]?.completed ? (
                          <span className="text-success text-sm">✅ 已完成</span>
                        ) : (
                          <span className="text-primary text-sm">○ 待学习</span>
                        )}
                        {courseProgress[course.id]?.bestScore && (
                          <span className="text-warning text-sm">
                            ⭐ {courseProgress[course.id].bestScore}分
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-text-light text-lg">还没有课程</p>
                <p className="text-gray-400 mt-2">点击右上角⚙️进入管理模式添加课程</p>
              </div>
            )}

          </section>
        </div>
      </main>
    </div>
  )
}
