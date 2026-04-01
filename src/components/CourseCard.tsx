import { motion } from 'framer-motion'
import type { Course } from '../data/types'
import { useProgressStore } from '../stores/progressStore'

interface CourseCardProps {
  course: Course
  onClick?: () => void
}

export default function CourseCard({ course, onClick }: CourseCardProps) {
  const totalStars = useProgressStore((s) => s.totalStars)
  
  const completedCount = course.lessons.filter(
    (l) => useProgressStore.getState().lessons[l.id]?.completed
  ).length

  const allCompleted = completedCount === course.lessons.length
  const isUnlocked = course.lessons.every((l) => 
    l.starsToUnlock === 0 || totalStars >= l.starsToUnlock
  )

  return (
    <motion.div
      className={`relative bg-surface rounded-2xl p-4 shadow-lg cursor-pointer card-hover border-4 ${
        allCompleted ? 'border-success/50' : 'border-transparent'
      }`}
      onClick={isUnlocked ? onClick : undefined}
      whileTap={isUnlocked ? { scale: 0.95 } : undefined}
      style={{ backgroundColor: isUnlocked ? course.coverColor : '#ccc' }}
    >
      {/* 课程封面 */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-4xl">{course.emoji}</span>
        <div>
          <h3 className="font-heading text-xl text-text font-bold">{course.title}</h3>
          <p className="text-text-light text-sm">
            {completedCount}/{course.lessons.length} 课完成
          </p>
        </div>
      </div>

      {/* 进度条 */}
      <div className="h-3 bg-white/50 rounded-full overflow-hidden">
        <motion.div
          className="h-full progress-rainbow"
          initial={{ width: 0 }}
          animate={{ width: `${(completedCount / course.lessons.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* 完成标记 */}
      {allCompleted && (
        <div className="absolute -top-2 -right-2 bg-success text-white rounded-full w-8 h-8 flex items-center justify-center text-lg">
          ✓
        </div>
      )}

      {/* 未解锁标记 */}
      {!isUnlocked && (
        <div className="absolute inset-0 bg-gray-500/50 rounded-2xl flex items-center justify-center">
          <span className="text-4xl">🔒</span>
        </div>
      )}
    </motion.div>
  )
}
