import { motion } from 'framer-motion'

interface TantanMascotProps {
  state?: 'idle' | 'happy' | 'cheer' | 'surprised'
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
}

const emojiMap = {
  idle: '🎸',
  happy: '🎉',
  cheer: '💪',
  surprised: '😮',
}

export default function TantanMascot({ 
  state = 'idle', 
  message, 
  size = 'md' 
}: TantanMascotProps) {
  const emoji = emojiMap[state]
  const sizeClass = sizeMap[size]

  return (
    <div className="relative inline-flex flex-col items-center">
      {/* 弹弹吉祥物 */}
      <motion.div
        className={`${sizeClass} relative flex items-center justify-center text-6xl`}
        animate={state === 'idle' ? { y: [0, -8, 0] } : 
                 state === 'happy' ? { rotate: [0, 360], scale: [1, 1.2, 1] } :
                 state === 'cheer' ? { y: [0, -15, 0], rotate: [-10, 10, -10] } :
                 { scale: [1, 1.3, 1] }}
        transition={state === 'idle' ? { repeat: Infinity, duration: 2 } :
                    state === 'happy' ? { duration: 0.6 } :
                    state === 'cheer' ? { repeat: Infinity, duration: 0.3 } :
                    { duration: 0.3 }}
      >
        {emoji}
        {/* 装饰星星（开心时显示） */}
        {state === 'happy' && (
          <>
            <motion.span 
              className="absolute -top-2 -left-2 text-2xl"
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: 1, rotate: 180 }}
              transition={{ duration: 0.3 }}
            >⭐</motion.span>
            <motion.span 
              className="absolute -top-2 -right-2 text-xl"
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: 1, rotate: -180 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >✨</motion.span>
          </>
        )}
      </motion.div>

      {/* 说话气泡 */}
      {message && (
        <motion.div 
          className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white rounded-2xl px-4 py-2 shadow-lg whitespace-nowrap"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <p className="text-text text-sm font-semibold">{message}</p>
          {/* 气泡小三角 */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-8 border-transparent border-t-white" />
        </motion.div>
      )}
    </div>
  )
}
