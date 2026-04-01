import { motion } from 'framer-motion'

interface TantanMascotProps {
  state?: 'idle' | 'happy' | 'cheer' | 'surprised'
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'text-5xl',
  md: 'text-7xl',
  lg: 'text-9xl',
}

export default function TantanMascot({ 
  state = 'idle', 
  message, 
  size = 'md' 
}: TantanMascotProps) {
  const sizeClass = sizeMap[size]

  return (
    <div className="relative inline-flex flex-col items-center">
      {/* 弹弹吉祥物 - 吉他动画 */}
      <motion.div
        className={`${sizeClass} relative flex items-center justify-center`}
        animate={
          state === 'idle' ? { 
            y: [0, -10, 0],
            rotate: [0, 5, 0, -5, 0],
          } :
          state === 'happy' ? { 
            scale: [1, 1.15, 1],
            rotate: [0, 15, -15, 0],
          } :
          state === 'cheer' ? { 
            y: [0, -20, -10, -20, 0],
            rotate: [-15, 15, -15],
            scale: [1, 1.1, 1],
          } :
          { scale: [1, 1.2, 1] }
        }
        transition={
          state === 'idle' ? { repeat: Infinity, duration: 2.5 } :
          state === 'happy' ? { duration: 0.6 } :
          state === 'cheer' ? { repeat: Infinity, duration: 0.4 } :
          { duration: 0.3 }
        }
      >
        <span className="filter drop-shadow-lg">🎸</span>
        
        {/* 装饰音符 */}
        <motion.div
          className="absolute -top-4 -right-6 text-2xl"
          animate={
            state === 'idle' ? { opacity: [0.3, 1, 0.3], y: [0, -5, 0] } :
            { opacity: [0, 1, 0], y: [-20, -30] }
          }
          transition={
            state === 'idle' ? { repeat: Infinity, duration: 3, delay: 0.5 } :
            { duration: 1, repeat: Infinity, repeatDelay: 0.5 }
          }
        >
          🎵
        </motion.div>
        
        <motion.div
          className="absolute -bottom-2 -left-6 text-xl"
          animate={
            state === 'idle' ? { opacity: [0.3, 1, 0.3], y: [0, 5, 0] } :
            { opacity: [0, 1, 0], y: [-15, -25] }
          }
          transition={
            state === 'idle' ? { repeat: Infinity, duration: 2.5, delay: 1 } :
            { duration: 0.8, repeat: Infinity, repeatDelay: 0.3 }
          }
        >
          ⭐
        </motion.div>

        {/* 开心时的额外特效 */}
        {(state === 'happy' || state === 'cheer') && (
          <>
            <motion.span 
              className="absolute -top-4 -left-4 text-3xl"
              animate={{ 
                scale: [0, 1.3, 1], 
                rotate: [0, 360],
                opacity: [1, 1, 0]
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              ✨
            </motion.span>
            <motion.span 
              className="absolute top-0 right-0 text-2xl"
              animate={{ 
                scale: [0, 1.2, 1], 
                rotate: [0, -360],
                opacity: [1, 1, 0]
              }}
              transition={{ duration: 0.5, delay: 0.2, repeat: Infinity }}
            >
              🎵
            </motion.span>
          </>
        )}
      </motion.div>

      {/* 说话气泡 */}
      {message && (
        <motion.div 
          className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white rounded-2xl px-4 py-2 shadow-lg whitespace-nowrap z-10"
          initial={{ scale: 0, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
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
