import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { courses } from '../data/courses'
import type { Mission } from '../stores/missionStore'
import { useMissionStore } from '../stores/missionStore'
import { useProgressStore } from '../stores/progressStore'
import SheetSearchWebView from '../components/SheetSearchWebView'

export default function Admin() {
  const navigate = useNavigate()
  const [showSheetSearch, setShowSheetSearch] = useState(false)
  const { missions, resetMissions, completeMission, startMission } = useMissionStore()
  const lessonProgress = useProgressStore((s) => s.lessons)

  const getStatusColor = (status: Mission['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'inProgress': return 'bg-orange-100 text-orange-700'
      case 'available': return 'bg-yellow-100 text-yellow-700'
      case 'locked': return 'bg-gray-100 text-gray-500'
    }
  }

  const getStatusText = (status: Mission['status']) => {
    switch (status) {
      case 'completed': return '已完成'
      case 'inProgress': return '进行中'
      case 'available': return '可挑战'
      case 'locked': return '已锁定'
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 顶部导航 */}
      <header className="bg-surface shadow-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            className="w-10 h-10 rounded-full bg-surface2 flex items-center justify-center text-xl"
            onClick={() => navigate('/')}
          >
            ←
          </button>
          <h1 className="font-heading text-xl text-text">🎯 任务管理</h1>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm('确定要重新加载所有任务吗？这将清空进度。')) {
                  useMissionStore.getState().initializeMissions(courses.map(c => ({
                    id: c.id,
                    title: c.title,
                    emoji: c.emoji,
                    lessons: c.lessons,
                  })))
                }
              }}
              className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-sm"
            >
              🔄 重新加载
            </button>
            <button
              onClick={() => {
                if (confirm('确定要重置所有任务吗？这将清空所有进度。')) {
                  resetMissions()
                }
              }}
              className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-sm"
            >
              🗑️ 重置
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* 任务列表 */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg text-text">📋 任务列表 ({missions.length})</h2>
          </div>

          <div className="space-y-3">
            {missions.map((mission, index) => {
              const progress = lessonProgress[mission.lessonId]
              return (
                <motion.div
                  key={mission.id}
                  className="bg-surface rounded-2xl overflow-hidden shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {/* 任务头部 */}
                  <div className={`
                    px-4 py-3 flex items-center gap-3
                    ${mission.status === 'completed' ? 'bg-green-50' :
                      mission.status === 'locked' ? 'bg-gray-50' : 'bg-orange-50'}
                  `}>
                    <span className="text-2xl">{mission.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-bold text-lg ${mission.status === 'locked' ? 'text-gray-400' : 'text-text'}`}>
                          {mission.title}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(mission.status)}`}>
                          {getStatusText(mission.status)}
                        </span>
                      </div>
                      
                      {/* 内容预览 */}
                      <div className="flex items-center gap-3 text-sm text-text-light mt-1">
                        {mission.content?.chordDiagram && (
                          <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                            🎸 {mission.content.chordDiagram}
                          </span>
                        )}
                        {mission.content?.standardNotes && mission.content.standardNotes.length > 0 && (
                          <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded">
                            🎵 {mission.content.standardNotes.length} 个音符
                          </span>
                        )}
                        {mission.content?.sheet?.imageUrl && (
                          <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded">
                            🖼️ 有图片谱子
                          </span>
                        )}
                      </div>

                      {/* 统计 */}
                      <div className="flex items-center gap-3 text-sm text-text-light mt-1">
                        <span>⭐ 奖励 {mission.starReward}星</span>
                        {progress && (
                          <>
                            <span>📝 练习 {progress.attempts}次</span>
                            <span>🏆 最高 {progress.bestScore}分</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {mission.status === 'locked' && (
                        <button
                          onClick={() => startMission(mission.id)}
                          className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium"
                        >
                          🔓 解锁
                        </button>
                      )}
                      {(mission.status === 'available' || mission.status === 'inProgress') && (
                        <>
                          <button
                            onClick={() => completeMission(mission.id)}
                            className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium"
                          >
                            ✅ 完成
                          </button>
                          <button
                            onClick={() => navigate(`/lesson/${mission.lessonId}`)}
                            className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium"
                          >
                            🎸 练习
                          </button>
                        </>
                      )}
                      {mission.status === 'completed' && (
                        <button
                          onClick={() => navigate(`/lesson/${mission.lessonId}`)}
                          className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
                        >
                          🔁 回顾
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* 统计 */}
        <section className="bg-surface rounded-2xl p-4 shadow">
          <h3 className="font-heading text-lg text-text mb-4">📊 学习统计</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-gray-100 rounded-xl p-3">
              <div className="text-2xl font-bold text-primary">{missions.length}</div>
              <div className="text-xs text-text-light">总任务</div>
            </div>
            <div className="bg-green-100 rounded-xl p-3">
              <div className="text-2xl font-bold text-green-600">
                {missions.filter(m => m.status === 'completed').length}
              </div>
              <div className="text-xs text-text-light">已完成</div>
            </div>
            <div className="bg-orange-100 rounded-xl p-3">
              <div className="text-2xl font-bold text-orange-600">
                {Object.values(lessonProgress).reduce((sum, p) => sum + (p?.attempts || 0), 0)}
              </div>
              <div className="text-xs text-text-light">总练习次数</div>
            </div>
            <div className="bg-yellow-100 rounded-xl p-3">
              <div className="text-2xl font-bold text-yellow-600">
                {Math.max(0, ...Object.values(lessonProgress).map(p => p?.bestScore || 0))}
              </div>
              <div className="text-xs text-text-light">最高分</div>
            </div>
          </div>
        </section>

        {/* 课程内容管理提示 */}
        <section className="mt-6 bg-blue-50 rounded-2xl p-4">
          <h3 className="font-heading text-lg text-blue-800 mb-2">💡 如何管理课程内容？</h3>
          <p className="text-blue-600 text-sm">
            课程内容（谱子、和弦图、音符）定义在 <code className="bg-blue-100 px-1 rounded">src/data/courses.ts</code> 文件中。
            修改该文件后，点击"🔄 重新加载"即可更新任务内容。
          </p>
        </section>
      </main>

      {/* 网络搜索 */}
      <SheetSearchWebView
        isOpen={showSheetSearch}
        onClose={() => setShowSheetSearch(false)}
        onSelectSheet={(url) => {
          console.log('Selected sheet:', url)
        }}
      />
    </div>
  )
}
