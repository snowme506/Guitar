import { motion } from 'framer-motion'

interface TandanLogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function TandanLogo({ size = 'md', className = '' }: TandanLogoProps) {
  const sizeMap = {
    sm: 60,
    md: 120,
    lg: 200,
  }

  const px = sizeMap[size]

  return (
    <motion.div
      className={`relative cursor-pointer inline-block ${className}`}
      whileHover="dance"
      initial="idle"
    >
      <motion.div
        variants={{
          idle: { rotate: 0, y: 0 },
          dance: {
            rotate: [-10, 10, -10, 10, 0],
            y: [-5, 5, -5, 5, 0],
            transition: {
              duration: 0.5,
              repeat: Infinity,
              repeatDelay: 0.2,
            },
          },
        }}
        style={{ display: 'inline-block' }}
      >
        <img
          src="/tandan-logo.jpg"
          alt="弹弹"
          style={{
            width: px,
            height: 'auto',
            borderRadius: '50%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}
        />
      </motion.div>

      {/* 音乐符号 - 跳舞时出现 */}
      <motion.div
        className="absolute -top-2 -right-2 text-2xl"
        variants={{
          idle: { opacity: 0, scale: 0 },
          dance: {
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1.2, 1],
            y: [0, -10],
            transition: {
              duration: 0.8,
              repeat: Infinity,
              repeatDelay: 0.3,
            },
          },
        }}
      >
        🎵
      </motion.div>

      <motion.div
        className="absolute -bottom-1 -left-2 text-xl"
        variants={{
          idle: { opacity: 0, scale: 0 },
          dance: {
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1.2, 1],
            y: [0, -8],
            transition: {
              duration: 0.6,
              repeat: Infinity,
              repeatDelay: 0.5,
            },
          },
        }}
      >
        ⭐
      </motion.div>
    </motion.div>
  )
}
