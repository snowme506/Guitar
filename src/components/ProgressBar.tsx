import { motion } from 'framer-motion'

interface ProgressBarProps {
  current: number
  total: number
  showLabel?: boolean
  color?: string
  rainbow?: boolean
}

export default function ProgressBar({ 
  current, 
  total, 
  showLabel = true,
  rainbow = false,
}: ProgressBarProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-sm text-text-light mb-1">
          <span>进度</span>
          <span>{current} / {total}</span>
        </div>
      )}
      <div className="h-4 bg-surface2 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${
            rainbow ? 'progress-rainbow' : 'bg-primary'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
