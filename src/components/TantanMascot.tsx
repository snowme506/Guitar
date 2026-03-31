import { motion } from 'framer-motion'

interface TantanMascotProps {
  state?: 'idle' | 'happy' | 'cheer' | 'surprised'
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 60,
  md: 100,
  lg: 140,
}

export default function TantanMascot({ 
  state = 'idle', 
  message, 
  size = 'md' 
}: TantanMascotProps) {
  const s = sizeMap[size]
  const isHappy = state === 'happy' || state === 'cheer'

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Speech Bubble */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl px-4 py-2 shadow-lg relative max-w-xs text-center"
        >
          <p className="text-sm font-medium text-text whitespace-nowrap">{message}</p>
          {/* Bubble tail */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45" />
        </motion.div>
      )}

      {/* Tantan - Cute Guitar Character SVG */}
      <motion.div
        className="relative cursor-pointer"
        style={{ width: s, height: s }}
        animate={{
          y: isHappy ? -10 : 0,
          rotate: isHappy ? 3 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Guitar body */}
          <ellipse cx="50" cy="60" rx="35" ry="30" fill="#D4A574" />
          <ellipse cx="50" cy="60" rx="28" ry="24" fill="#E8C9A0" />
          {/* Sound hole */}
          <circle cx="50" cy="60" r="10" fill="#5D4E37" />
          {/* Neck */}
          <rect x="45" y="15" width="10" height="35" fill="#8B7355" rx="2" />
          {/* Headstock */}
          <rect x="42" y="5" width="16" height="12" fill="#8B7355" rx="3" />
          {/* Tuning pegs */}
          <circle cx="44" cy="9" r="2" fill="#FFD700" />
          <circle cx="56" cy="9" r="2" fill="#FFD700" />
          <circle cx="44" cy="15" r="2" fill="#FFD700" />
          <circle cx="56" cy="15" r="2" fill="#FFD700" />
          {/* Strings */}
          <line x1="47" y1="20" x2="47" y2="90" stroke="#C0C0C0" strokeWidth="0.5" />
          <line x1="50" y1="20" x2="50" y2="90" stroke="#C0C0C0" strokeWidth="0.5" />
          <line x1="53" y1="20" x2="53" y2="90" stroke="#C0C0C0" strokeWidth="0.5" />
          {/* Face */}
          <circle cx="38" cy="55" r="6" fill="white" />
          <circle cx="62" cy="55" r="6" fill="white" />
          <circle cx="40" cy="56" r="3" fill="#5D4E37" />
          <circle cx="64" cy="56" r="3" fill="#5D4E37" />
          {/* Eye shine */}
          <circle cx="41" cy="55" r="1" fill="white" />
          <circle cx="65" cy="55" r="1" fill="white" />
          {/* Mouth */}
          <path
            d={isHappy ? "M 45 68 Q 50 75 55 68" : "M 45 68 Q 50 72 55 68"}
            fill="none"
            stroke="#5D4E37"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Blush */}
          <ellipse cx="30" cy="65" rx="5" ry="3" fill="#FFB347" opacity="0.5" />
          <ellipse cx="70" cy="65" rx="5" ry="3" fill="#FFB347" opacity="0.5" />
        </svg>

        {/* Sparkles when happy */}
        {isHappy && (
          <>
            <motion.span
              className="absolute -top-1 -right-2 text-lg"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
            >
              ✨
            </motion.span>
            <motion.span
              className="absolute -top-1 -left-3 text-base"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              ⭐
            </motion.span>
          </>
        )}
      </motion.div>

      {/* Name tag */}
      <p className="text-xs font-bold text-text-light">我是弹弹 🎸</p>
    </div>
  )
}
