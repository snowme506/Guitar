import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MissionCard } from './MissionCard'
import { useMissionStore, type Mission } from '../stores/missionStore'

interface MissionListProps {
  onSelectMission: (mission: Mission) => void
}

export function MissionList({ onSelectMission }: MissionListProps) {
  const { missions, getTodayMissions } = useMissionStore()
  const [activeTab, setActiveTab] = useState<'today' | 'all'>('today')

  const todayMissions = getTodayMissions()
  const availableMissions = missions.filter(m => m.status === 'available')
  const completedMissions = missions.filter(m => m.status === 'completed')

  const displayMissions = activeTab === 'today' ? todayMissions : availableMissions

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return '早上好!'
    if (hour < 18) return '下午好!'
    return '晚上好!'
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center py-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl mb-2"
        >
          🎸
        </motion.div>
        <h2 className="text-2xl font-bold text-amber-900">
          {getGreeting()}
        </h2>
        <p className="text-amber-700">
          今天想完成哪个任务呢？
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 p-1 bg-amber-100 rounded-2xl">
        <button
          onClick={() => setActiveTab('today')}
          className={`
            flex-1 py-2 px-4 rounded-xl font-bold text-sm
            transition-all duration-200
            ${activeTab === 'today'
              ? 'bg-white text-amber-600 shadow-sm'
              : 'text-amber-500 hover:text-amber-700'
            }
          `}
        >
          🌟 今日任务 ({todayMissions.length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`
            flex-1 py-2 px-4 rounded-xl font-bold text-sm
            transition-all duration-200
            ${activeTab === 'all'
              ? 'bg-white text-amber-600 shadow-sm'
              : 'text-amber-500 hover:text-amber-700'
            }
          `}
        >
          📋 所有任务 ({availableMissions.length})
        </button>
      </div>

      {/* Mission list */}
      <AnimatePresence mode="wait">
        {displayMissions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-amber-800 mb-2">
              太棒了！
            </h3>
            <p className="text-amber-600">
              {activeTab === 'today' 
                ? '今日任务全部完成啦！明天再来吧~'
                : '所有任务都完成啦！你是最棒的！'
              }
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-3"
          >
            {displayMissions.map((mission, index) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                index={index}
                onStart={onSelectMission}
                onContinue={onSelectMission}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completed section (always visible at bottom) */}
      {completedMissions.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-bold text-amber-600 mb-3 flex items-center gap-2">
            <span>🏆</span>
            已完成任务 ({completedMissions.length})
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {completedMissions.slice(0, 6).map(mission => (
              <motion.div
                key={mission.id}
                whileHover={{ scale: 1.05 }}
                className="bg-green-100 rounded-xl p-3 text-center"
              >
                <div className="text-2xl mb-1">{mission.emoji}</div>
                <div className="text-xs text-green-700 font-medium truncate">
                  {mission.title}
                </div>
                <div className="text-yellow-500">✓</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
