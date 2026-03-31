import { motion } from 'framer-motion'

interface StarDisplayProps {
  count: number
  size?: 'sm' | 'md' | 'lg'
  animate?: boolean
}

const sizeMap = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
}

export default function StarDisplay({ count, size = 'md', animate = false }: StarDisplayProps) {
  return (
    <div className={`flex items-center gap-1 ${sizeMap[size]}`}>
      {Array.from({ length: Math.min(count, 5) }, (_, i) => (
        <motion.span
          key={i}
          initial={animate ? { scale: 0, rotate: -180 } : undefined}
          animate={animate ? { scale: 1, rotate: 0 } : undefined}
          transition={{ delay: i * 0.1, type: 'spring' }}
        >
          ⭐
        </motion.span>
      ))}
      {count > 5 && (
        <span className="text-text-light text-sm">+{count - 5}</span>
      )}
    </div>
  )
}

interface StarButtonProps {
  earned: boolean
  onClick?: () => void
}

export function StarButton({ earned, onClick }: StarButtonProps) {
  return (
    <motion.button
      className={`text-3xl transition-all ${earned ? 'scale-110' : 'grayscale opacity-50'}`}
      whileTap={{ scale: 0.8 }}
      whileHover={{ scale: earned ? 1.2 : 1 }}
      onClick={onClick}
    >
      {earned ? '⭐' : '☆'}
    </motion.button>
  )
}
