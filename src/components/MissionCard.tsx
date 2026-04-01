import { motion } from 'framer-motion'
import type { Mission } from '../stores/missionStore'
import { useProgressStore } from '../stores/progressStore'
import StarDisplay from './StarDisplay'

interface MissionCardProps {
  mission: Mission
  onStart: (mission: Mission) => void
  onContinue?: (mission: Mission) => void
  index?: number
}

export function MissionCard({ mission, onStart, onContinue, index = 0 }: MissionCardProps) {
  useProgressStore() // Just to subscribe to store

  const isLocked = mission.status === 'locked'
  const isCompleted = mission.status === 'completed'
  const isInProgress = mission.status === 'inProgress'

  const getStatusColor = () => {
    if (isCompleted) return 'from-green-400 to-green-500'
    if (isInProgress) return 'from-orange-400 to-orange-500'
    if (isLocked) return 'from-gray-300 to-gray-400'
    return 'from-yellow-400 to-orange-400'
  }

  const getButtonText = () => {
    if (isCompleted) return '已完成 ✓'
    if (isInProgress) return '继续练习 →'
    if (isLocked) return '🔒 需要先完成任务'
    return '开始任务 →'
  }

  const handleClick = () => {
    if (isCompleted) return
    if (isLocked) return
    if (isInProgress && onContinue) {
      onContinue(mission)
    } else {
      onStart(mission)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={`
        relative overflow-hidden rounded-3xl p-5
        bg-gradient-to-br ${getStatusColor()}
        ${isLocked ? 'opacity-60' : 'cursor-pointer'}
        ${isCompleted ? 'ring-2 ring-green-400' : ''}
        shadow-lg hover:shadow-xl
        transition-all duration-300
      `}
      onClick={handleClick}
    >
      {/* Lock overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">🔒</div>
            <div className="text-white text-sm font-bold">
              完成上方任务解锁
            </div>
          </div>
        </div>
      )}

      {/* Completed checkmark */}
      {isCompleted && (
        <div className="absolute top-3 right-3 text-2xl">✓</div>
      )}

      {/* Mission content */}
      <div className="flex items-start gap-4">
        {/* Emoji bubble */}
        <motion.div
          whileHover={{ scale: isLocked ? 1 : 1.1 }}
          whileTap={{ scale: isLocked ? 1 : 0.95 }}
          className={`
            w-16 h-16 rounded-2xl
            bg-white/30 backdrop-blur-sm
            flex items-center justify-center text-3xl
            ${isLocked ? 'grayscale' : ''}
          `}
        >
          {mission.emoji}
        </motion.div>

        {/* Mission info */}
        <div className="flex-1 min-w-0">
          {/* Type badge */}
          <div className="inline-block px-2 py-0.5 rounded-full bg-white/20 text-white text-xs mb-1">
            {mission.type === 'newLesson' && '新课程'}
            {mission.type === 'practice' && '练习'}
            {mission.type === 'review' && '复习'}
          </div>

          {/* Title */}
          <h3 className={`
            font-bold text-lg text-white mb-1
            ${isLocked ? 'line-through' : ''}
          `}>
            {mission.title}
          </h3>

          {/* Description */}
          <p className="text-white/80 text-sm line-clamp-2">
            {mission.description}
          </p>
        </div>
      </div>

      {/* Star reward & button */}
      <div className="flex items-center justify-between mt-4">
        {/* Star reward */}
        <div className="flex items-center gap-1">
          <span className="text-white/80 text-sm">奖励:</span>
          <StarDisplay count={mission.starReward} size="sm" />
        </div>

        {/* Action button */}
        {!isLocked && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              px-4 py-2 rounded-full font-bold text-sm
              ${isCompleted 
                ? 'bg-white/30 text-white cursor-default'
                : 'bg-white text-orange-500 hover:bg-white/90'
              }
            `}
            onClick={(e) => {
              e.stopPropagation()
              handleClick()
            }}
          >
            {getButtonText()}
          </motion.button>
        )}
      </div>

      {/* Progress indicator for inProgress */}
      {isInProgress && (
        <div className="mt-3">
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '60%' }}
              transition={{ duration: 0.5 }}
              className="h-full bg-white rounded-full"
            />
          </div>
          <p className="text-white/60 text-xs mt-1">继续上次的学习...</p>
        </div>
      )}
    </motion.div>
  )
}
