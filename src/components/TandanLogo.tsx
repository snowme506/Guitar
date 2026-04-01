import { motion } from 'framer-motion'

interface TandanLogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function TandanLogo({ size = 'md', className = '' }: TandanLogoProps) {
  const sizeMap = {
    sm: 60,
    md: 140,
    lg: 240,
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
            rotate: [-8, 8, -8, 8, 0],
            y: [-8, 8, -8, 8, 0],
            transition: {
              duration: 0.4,
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
            borderRadius: '12px',
          }}
        />
      </motion.div>

      {/* 音乐符号 - 跳舞时出现 */}
      <motion.div
        className="absolute -top-1 -right-3 text-2xl"
        variants={{
          idle: { opacity: 0, scale: 0 },
          dance: {
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1.2, 1],
            y: [0, -15],
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
        className="absolute -bottom-1 -left-3 text-xl"
        variants={{
          idle: { opacity: 0, scale: 0 },
          dance: {
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1.2, 1],
            y: [0, -12],
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
