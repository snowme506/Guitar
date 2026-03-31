import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { courses } from '../data/courses'
import { useProgressStore } from '../stores/progressStore'
import TantanMascot from '../components/TantanMascot'
import SheetView from '../components/SheetView'
import RecordButton from '../components/RecordButton'
import ScoreCard from '../components/ScoreCard'
import Confetti from '../components/Confetti'
import SheetSearchWebView from '../components/SheetSearchWebView'

export default function Lesson() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()
  const [showConfetti, setShowConfetti] = useState(false)
  const [showScore, setShowScore] = useState(false)
  const [currentScore, setCurrentScore] = useState(0)
  const [showSheetSearch, setShowSheetSearch] = useState(false)
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null)

  // 找到当前课时
  const lesson = courses
    .flatMap(c => c.lessons)
    .find(l => l.id === lessonId)

  const course = courses.find(c => c.lessons.some(l => l.id === lessonId))

  const handleRecordingComplete = (_blob: Blob, url: string) => {
    setRecordingUrl(url)
    // 模拟评分
    const score = Math.floor(Math.random() * 30) + 70 // 70-100
    const stars = score >= 90 ? 3 : score >= 70 ? 2 : 1
    setCurrentScore(score)
    
    // 更新进度
    useProgressStore.getState().completeLesson(lessonId!, score, stars)
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
    <div className="min-h-screen bg-background pb-20">
      {/* 顶部导航 */}
      <header className="bg-surface shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            className="w-10 h-10 rounded-full bg-surface2 flex items-center justify-center text-xl"
            onClick={() => navigate('/')}
          >
            ←
          </button>
          <div>
            <h1 className="font-heading text-lg text-text">{lesson.title}</h1>
            {course && (
              <p className="text-text-light text-sm">{course.title}</p>
            )}
          </div>
        </div>
      </header>

      {/* 撒花效果 */}
      <Confetti isActive={showConfetti} />

      {/* 主内容 - 左中右三栏布局 */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {!showScore ? (
            <motion.div
              key="lesson"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-12 gap-6 items-start"
            >
              {/* 左侧 - 弹弹和按钮 */}
              <div className="col-span-12 lg:col-span-3 order-2 lg:order-1">
                <div className="bg-surface rounded-2xl p-6 shadow-lg sticky top-24">
                  {/* 弹弹 */}
                  <div className="flex flex-col items-center mb-6">
                    <TantanMascot 
                      state="cheer" 
                      message="加油！你可以的！💪" 
                      size="lg"
                    />
                  </div>

                  {/* 操作按钮 */}
                  <div className="space-y-3">
                    <button
                      className="w-full py-3 bg-surface2 text-text rounded-xl font-semibold flex items-center justify-center gap-2"
                      onClick={() => setShowSheetSearch(true)}
                    >
                      🔍 搜索谱子
                    </button>
                    <button
                      className="w-full py-3 bg-surface2 text-text rounded-xl font-semibold flex items-center justify-center gap-2"
                      onClick={() => navigate('/')}
                    >
                      🏠 返回首页
                    </button>
                  </div>
                </div>
              </div>

              {/* 中间 - 谱子 */}
              <div className="col-span-12 lg:col-span-6 order-1 lg:order-2">
                <div className="bg-surface rounded-2xl p-4 shadow-lg">
                  <h3 className="font-heading text-lg text-text mb-3 text-center">🎼 跟弹谱子</h3>
                  <SheetView sheet={lesson.content.sheet} />
                </div>
              </div>

              {/* 右侧 - 录音 */}
              <div className="col-span-12 lg:col-span-3 order-3">
                <div className="bg-surface rounded-2xl p-6 shadow-lg sticky top-24">
                  <h3 className="font-heading text-lg text-text mb-4 text-center">
                    🎤 录下你的演奏
                  </h3>
                  
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

      {/* WebView 搜索弹窗 */}
      <SheetSearchWebView
        isOpen={showSheetSearch}
        onClose={() => setShowSheetSearch(false)}
        onSelectSheet={(url) => {
          // TODO: 更新课时谱子
          console.log('Selected sheet:', url)
        }}
      />
    </div>
  )
}
