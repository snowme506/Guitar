import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { courses } from '../data/courses'
import { useProgressStore } from '../stores/progressStore'
import { useMissionStore } from '../stores/missionStore'
import { useDailyMissionStore } from '../stores/dailyMissionStore'
import TantanMascot from '../components/TantanMascot'
import SheetView from '../components/SheetView'
import RecordButton from '../components/RecordButton'
import ScoreCard from '../components/ScoreCard'
import Confetti from '../components/Confetti'


export default function Lesson() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()
  const [showConfetti, setShowConfetti] = useState(false)
  const [showScore, setShowScore] = useState(false)
  const [currentScore, setCurrentScore] = useState(0)

  const [recordingUrl, setRecordingUrl] = useState<string | null>(null)

  // 从任务获取课时内容（任务直接包含所有内容）
  const missionId = lessonId ? `mission-${lessonId}` : null
  const missions = useMissionStore((s) => s.missions)
  const mission = missions.find(m => m.id === missionId)
  
  // 兼容：从 courses 找（如果 mission 里没有）
  const lesson = courses
    .flatMap(c => c.lessons)
    .find(l => l.id === lessonId)
  const course = courses.find(c => c.lessons.some(l => l.id === lessonId))

  // 使用 mission 里的内容（优先）或者 fallback 到 course 里的
  const lessonContent = mission?.content || lesson?.content || {}
  const lessonTitle = mission?.title || lesson?.title || '未知课时'

  const handleRecordingComplete = (_blob: Blob, url: string) => {
    setRecordingUrl(url)
    // 模拟评分
    const score = Math.floor(Math.random() * 30) + 70 // 70-100
    const stars = score >= 90 ? 3 : score >= 70 ? 2 : 1
    setCurrentScore(score)
    
    // 更新进度
    useProgressStore.getState().completeLesson(lessonId!, score, stars)
    
    // 完成对应的任务
    const missionId = `mission-${lessonId}`
    useMissionStore.getState().completeMission(missionId)
    
    // 记录今日任务的练习次数
    useDailyMissionStore.getState().recordPractice(lessonId!)
    
    setShowConfetti(true)
    setShowScore(true)
  }

  const handleRetry = () => {
    setShowScore(false)
    setRecordingUrl(null)
  }

  const handleContinue = () => {
    // 找到下一课
    const currentIndex = course?.lessons.findIndex(l => l.id === lessonId) ?? -1
    const nextLesson = course?.lessons[currentIndex + 1]
    if (nextLesson) {
      navigate(`/lesson/${nextLesson.id}`)
    } else {
      navigate('/')
    }
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">😢</p>
          <p className="text-text">找不到这节课</p>
          <button
            className="mt-4 px-6 py-2 bg-primary text-white rounded-xl"
            onClick={() => navigate('/')}
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* 顶部导航 */}
      <header className="bg-surface shadow-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            className="w-10 h-10 rounded-full bg-surface2 flex items-center justify-center text-xl"
            onClick={() => navigate('/')}
          >
            ←
          </button>
          <div>
            <h1 className="font-heading text-lg text-text">{lessonTitle}</h1>
            {mission?.emoji && (
              <p className="text-text-light text-sm">{mission.emoji} 任务</p>
            )}
          </div>
        </div>
      </header>

      {/* 撒花效果 */}
      <Confetti isActive={showConfetti} />

      {/* 主内容 */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {!showScore ? (
            <motion.div
              key="lesson"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* 谱子 */}
              <div>
                <h3 className="font-heading text-lg text-text mb-3">🎼 {lessonContent.chordDiagram || '跟弹谱子'}</h3>
                <SheetView 
                  sheet={lessonContent.sheet as any}
                />
              </div>

              {/* 录音区 */}
              <div className="bg-surface rounded-2xl p-6 shadow-lg">
                <h3 className="font-heading text-lg text-text mb-4 text-center">
                  🎤 录下你弹的曲子
                </h3>
                <div className="flex justify-center">
                  <RecordButton onRecordingComplete={handleRecordingComplete} />
                </div>
                {recordingUrl && (
                  <div className="mt-4 text-center">
                    <audio src={recordingUrl} controls className="mx-auto" />
                  </div>
                )}
              </div>

              {/* 弹弹加油 */}
              <div className="flex justify-center">
                <TantanMascot 
                  state="cheer" 
                  message="加油！你可以的！💪" 
                  size="md"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="score"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md mx-auto"
            >
              <ScoreCard
                score={currentScore}
                stars={currentScore >= 90 ? 3 : currentScore >= 70 ? 2 : 1}
                onRetry={handleRetry}
                onContinue={handleContinue}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
