import { motion } from 'framer-motion'
import TantanMascot from './TantanMascot'
import StarDisplay from './StarDisplay'

interface ScoreCardProps {
  score: number
  stars: number
  message?: string
  onRetry?: () => void
  onContinue?: () => void
}

export default function ScoreCard({ 
  score, 
  stars, 
  message,
  onRetry,
  onContinue 
}: ScoreCardProps) {
  const getEmoji = () => {
    if (score >= 90) return '🎉'
    if (score >= 70) return '👏'
    if (score >= 50) return '💪'
    return '😊'
  }

  const getDefaultMessage = () => {
    if (score >= 90) return '太棒了！弹弹觉得你超级厉害！'
    if (score >= 70) return '很好！继续保持！'
    if (score >= 50) return '有进步！再练练会更棒！'
    return '加油！你可以的！'
  }

  return (
    <motion.div
      className="bg-surface rounded-2xl p-6 shadow-xl text-center"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
    >
      {/* 得分大数字 */}
      <motion.div
        className="text-7xl font-bold text-primary mb-2"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
      >
        {score}
        <span className="text-3xl text-text-light">分</span>
      </motion.div>

      {/* 星星 */}
      <StarDisplay count={stars} size="lg" animate />

      {/* 弹弹评价 */}
      <div className="my-4">
        <p className="text-4xl mb-2">{getEmoji()}</p>
        <p className="text-text font-semibold">
          {message ?? getDefaultMessage()}
        </p>
      </div>

      {/* 弹弹吉祥物 */}
      <div className="flex justify-center my-4">
        <TantanMascot 
          state={score >= 70 ? 'happy' : 'cheer'} 
          size="md"
        />
      </div>

      {/* 按钮 */}
      <div className="flex gap-4 mt-6">
        {onRetry && (
          <motion.button
            className="flex-1 py-3 bg-surface2 text-text rounded-xl font-semibold"
            whileTap={{ scale: 0.95 }}
            onClick={onRetry}
          >
            🔄 再练一次
          </motion.button>
        )}
        {onContinue && (
          <motion.button
            className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold"
            whileTap={{ scale: 0.95 }}
            onClick={onContinue}
          >
            继续 ➡
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}
