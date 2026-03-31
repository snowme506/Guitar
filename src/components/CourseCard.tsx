import { motion } from 'framer-motion'
import type { Course } from '../data/types'

interface CourseCardProps {
  course: Course
  onClick?: () => void
}

export default function CourseCard({ course, onClick }: CourseCardProps) {
  return (
    <motion.div
      className="bg-surface rounded-2xl p-4 shadow-lg cursor-pointer card-hover border-4 border-transparent"
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
    >
      <div className="flex items-center gap-4">
        <span className="text-4xl">{course.emoji}</span>
        <div className="flex-1">
          <h3 className="font-heading text-xl text-text font-bold">{course.title}</h3>
          <p className="text-text-light text-sm">
            📅 {course.date}
            {course.sheet?.imageUrl && ' • 🎼 有谱子'}
          </p>
        </div>
        <span className="text-2xl">→</span>
      </div>
    </motion.div>
  )
}
