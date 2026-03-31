import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { rewards } from '../data/courses'
import { useProgressStore } from '../stores/progressStore'
export default function Rewards() {
  const navigate = useNavigate()
  const { totalStars, outfits, earnedBadges, unlockOutfit } = useProgressStore()

  const handleUnlock = (rewardId: string, cost: number) => {
    if (totalStars >= cost) {
      useProgressStore.getState().addStars(-cost)
      unlockOutfit(rewardId)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 顶部导航 */}
      <header className="bg-surface shadow-sm sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            className="w-10 h-10 rounded-full bg-surface2 flex items-center justify-center text-xl"
            onClick={() => navigate('/')}
          >
            ←
          </button>
          <h1 className="font-heading text-xl text-text">🏆 奖励商店</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* 星星余额 */}
        <motion.div
          className="bg-gradient-to-r from-star to-gold rounded-2xl p-6 text-white mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <p className="text-sm opacity-90">我的星星</p>
          <p className="text-5xl font-bold mb-2">⭐ {totalStars}</p>
          <p className="text-sm opacity-80">
            继续努力，解锁更多奖励！
          </p>
        </motion.div>

        {/* 弹弹装饰 */}
        <section className="mb-8">
          <h2 className="font-heading text-lg text-text mb-4">🎩 弹弹的新装扮</h2>
          <div className="grid grid-cols-2 gap-4">
            {rewards
              .filter(r => r.type === 'outfit')
              .map(reward => {
                const isOwned = outfits.includes(reward.id)
                const canAfford = totalStars >= reward.cost

                return (
                  <motion.div
                    key={reward.id}
                    className={`bg-surface rounded-2xl p-4 text-center shadow ${
                      isOwned ? 'ring-4 ring-success' : ''
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <p className="text-5xl mb-2">{reward.emoji}</p>
                    <p className="font-semibold text-text">{reward.name}</p>
                    {isOwned ? (
                      <span className="inline-block mt-2 px-3 py-1 bg-success text-white text-sm rounded-full">
                        已拥有 ✓
                      </span>
                    ) : (
                      <button
                        className={`mt-2 px-4 py-1 rounded-full text-sm font-semibold ${
                          canAfford
                            ? 'bg-primary text-white'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                        disabled={!canAfford}
                        onClick={() => handleUnlock(reward.id, reward.cost)}
                      >
                        ⭐ {reward.cost}
                      </button>
                    )}
                  </motion.div>
                )
              })}
          </div>
        </section>

        {/* 徽章 */}
        <section>
          <h2 className="font-heading text-lg text-text mb-4">🏆 徽章墙</h2>
          <div className="grid grid-cols-3 gap-4">
            {rewards
              .filter(r => r.type === 'badge')
              .map(reward => {
                const isEarned = earnedBadges.includes(reward.id)

                return (
                  <motion.div
                    key={reward.id}
                    className={`bg-surface rounded-2xl p-4 text-center shadow ${
                      isEarned ? 'ring-4 ring-star' : 'grayscale opacity-50'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <p className="text-4xl mb-2">{reward.emoji}</p>
                    <p className="font-semibold text-text text-sm">{reward.name}</p>
                    {isEarned && (
                      <span className="text-xs text-star">已获得</span>
                    )}
                  </motion.div>
                )
              })}
          </div>
        </section>
      </main>
    </div>
  )
}
