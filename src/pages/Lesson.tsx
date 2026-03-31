import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { courses } from '../data/courses'
import { useProgressStore } from '../stores/progressStore'
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

  // 找到当前课程
  const course = courses.find(c => c.id === lessonId)

  const handleRecordingComplete = (_blob: Blob, url: string) => {
    setRecordingUrl(url)
    // 模拟评分
    const score = Math.floor(Math.random() * 30) + 70 // 70-100
    const stars = score >= 90 ? 3 : score >= 70 ? 2 : 1
    setCurrentScore(score)
    
    // 更新进度
    useProgressStore.getState().completeCourse(lessonId!, score, stars)
    setShowConfetti(true)
    setShowScore(true)
  }

  const handleRetry = () => {
    setShowScore(false)
    setRecordingUrl(null)
  }

  const handleContinue = () => {
    navigate('/')
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">😢</p>
          <p className="text-text">找不到这个课程</p>
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-4 py-3 flex items-center gap-3 bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <button 
          onClick={() => navigate('/')} 
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-text truncate">{course.title}</h1>
        </div>
        <div className="text-sm text-text-light">
          📅 {course.date}
        </div>
      </header>

      {/* 撒花效果 */}
      <Confetti isActive={showConfetti} />

      {/* Main Content - Three Column Layout */}
      <main className="px-4 py-6">
        <AnimatePresence mode="wait">
          {!showScore ? (
            <motion.div
              key="lesson"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto"
            >
              
              {/* 左侧 - 弹弹 */}
              <div className="lg:w-64 flex-shrink-0">
                <div className="bg-white rounded-2xl p-5 shadow-lg lg:sticky lg:top-24">
                  <div className="text-center">
                    <TantanMascot 
                      state="cheer" 
                      message="加油！你可以的！💪" 
                      size="lg"
                    />
                  </div>
                  
                  <div className="mt-4 space-y-3 text-center">
                    <button
                      className="w-full py-3 bg-surface2 text-text rounded-xl font-semibold"
                      onClick={() => navigate('/')}
                    >
                      🏠 返回首页
                    </button>
                  </div>
                </div>
              </div>

              {/* 中间 - 谱子 */}
              <div className="flex-1">
                <div className="bg-white rounded-2xl p-4 shadow-lg">
                  <h2 className="font-bold text-text flex items-center gap-2 mb-3">
                    <span>📜</span> 跟弹谱子
                  </h2>
                  <SheetView sheet={course.sheet} />
                </div>
              </div>

              {/* 右侧 - 录音 */}
              <div className="lg:w-72 flex-shrink-0">
                <div className="bg-white rounded-2xl p-5 shadow-lg lg:sticky lg:top-24">
                  <h2 className="font-bold text-text flex items-center gap-2 mb-4">
                    <span>🎤</span> 录下你的演奏
                  </h2>
                  
                  <div className="flex flex-col items-center">
                    <RecordButton onRecordingComplete={handleRecordingComplete} />
                    
                    {recordingUrl && (
                      <div className="mt-4 w-full">
                        <audio src={recordingUrl} controls className="w-full" />
                      </div>
                    )}
                  </div>
                </div>
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
