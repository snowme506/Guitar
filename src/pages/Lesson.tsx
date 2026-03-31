import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useProgressStore } from '../stores/progressStore'
import TantanMascot from '../components/TantanMascot'
import SheetView from '../components/SheetView'
import RecordButton from '../components/RecordButton'
import ScoreCard from '../components/ScoreCard'
import Confetti from '../components/Confetti'

export default function Lesson() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()
  
  const practices = useProgressStore((s) => s.practices)
  const recordDailyPractice = useProgressStore((s) => s.recordDailyPractice)
  const getTodayPracticeCount = useProgressStore((s) => s.getTodayPracticeCount)
  const isPermanentlyCompleted = useProgressStore((s) => s.isPermanentlyCompleted)
  
  const [showConfetti, setShowConfetti] = useState(false)
  const [showScore, setShowScore] = useState(false)
  const [currentScore, setCurrentScore] = useState(0)
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null)
  
  // 鼓励弹窗
  const [showEncourage, setShowEncourage] = useState(false)
  const [encourageText, setEncourageText] = useState('')
  
  // 30秒冷却
  const [cooldown, setCooldown] = useState(0)
  const [lastClickTime, setLastClickTime] = useState(0)
  
  // 找到当前练习
  const practice = practices.find(p => p.id === lessonId)
  
  // 今日练习次数
  const todayCount = lessonId ? getTodayPracticeCount(lessonId) : 0
  const permanentDone = lessonId ? isPermanentlyCompleted(lessonId) : false
  
  // 鼓励语
  const encouragements = [
    '太棒了！🎉',
    '加油！💪',
    '再来一次！🎸',
    '你真厉害！🌟',
    '继续努力！✨',
    '弹得真好听！🎵',
  ]
  
  // 冷却倒计时
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])
  
  const handlePractice = () => {
    if (!lessonId || cooldown > 0 || permanentDone) return
    
    // 检查是否今天已完成3次
    if (todayCount >= 3) return
    
    // 30秒冷却
    const now = Date.now()
    if (now - lastClickTime < 30000 && lastClickTime > 0) {
      return
    }
    
    setLastClickTime(now)
    setCooldown(30)
    recordDailyPractice(lessonId)
    
    // 显示鼓励
    const text = encouragements[Math.floor(Math.random() * encouragements.length)]
    setEncourageText(text)
    setShowEncourage(true)
    setTimeout(() => setShowEncourage(false), 1500)
    
    // 如果完成3次，撒花
    if (todayCount + 1 >= 3) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }
  }
  
  const handleRecordingComplete = (_blob: Blob, url: string) => {
    setRecordingUrl(url)
    // 模拟评分
    const score = Math.floor(Math.random() * 30) + 70
    setCurrentScore(score)
    
    if (lessonId) {
      useProgressStore.getState().recordDailyPractice(lessonId)
    }
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

  if (!practice) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">😢</p>
          <p className="text-text">找不到这个练习</p>
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

  const getStatusLabel = () => {
    if (permanentDone) return '✅ 已永久完成'
    if (practice.status === 'completed') return '✅ 今日已完成'
    if (practice.status === 'in_progress') return '🔄 练习中'
    return '○ 待练习'
  }

  const getStatusColor = () => {
    if (permanentDone || practice.status === 'completed') return 'text-success'
    if (practice.status === 'in_progress') return 'text-primary'
    return 'text-text-light'
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
          <h1 className="font-bold text-text truncate">{practice.title}</h1>
        </div>
        <div className={`text-sm ${getStatusColor()}`}>
          {getStatusLabel()}
        </div>
      </header>

      {/* 撒花效果 */}
      <Confetti isActive={showConfetti} />
      
      {/* 鼓励弹窗 */}
      <AnimatePresence>
        {showEncourage && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <div className="bg-white rounded-3xl px-8 py-6 shadow-2xl text-center">
              <p className="text-4xl font-bold text-primary mb-2">
                {encourageText}
              </p>
              <p className="text-text-light">
                今日进度: {todayCount}/3
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              
              {/* 左侧 - 弹弹 + 练习按钮 */}
              <div className="lg:w-72 flex-shrink-0">
                <div className="bg-white rounded-2xl p-5 shadow-lg lg:sticky lg:top-24">
                  {/* 弹弹 */}
                  <div className="text-center mb-4">
                    <TantanMascot 
                      state={permanentDone || todayCount >= 3 ? 'happy' : 'cheer'} 
                      message={permanentDone ? '太厉害了！' : todayCount >= 3 ? '今天完成啦！' : '加油练习！💪'} 
                      size="lg"
                    />
                  </div>
                  
                  {/* 今日练习进度 */}
                  <div className="text-center mb-4">
                    <p className="text-text-light text-sm mb-2">今日练习进度</p>
                    <div className="flex justify-center gap-2">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                            i < todayCount 
                              ? 'bg-success text-white' 
                              : 'bg-gray-200 text-gray-400'
                          }`}
                          animate={i === todayCount && cooldown > 0 ? { scale: [1, 0.9, 1] } : {}}
                        >
                          {i < todayCount ? '✓' : i + 1}
                        </motion.div>
                      ))}
                    </div>
                    {permanentDone ? (
                      <p className="text-success text-sm mt-2 font-bold">🎉 永久完成！</p>
                    ) : todayCount >= 3 ? (
                      <p className="text-success text-sm mt-2 font-bold">✅ 今日完成！</p>
                    ) : (
                      <p className="text-text-light text-sm mt-2">
                        还差 {3 - todayCount} 次
                      </p>
                    )}
                  </div>
                  
                  {/* 练习按钮 */}
                  {permanentDone ? (
                    <div className="text-center py-4 bg-success/10 rounded-xl">
                      <p className="text-2xl mb-2">🏆</p>
                      <p className="text-success font-bold">已永久完成！</p>
                      <p className="text-text-light text-sm">太厉害了！</p>
                    </div>
                  ) : todayCount >= 3 ? (
                    <div className="text-center py-4 bg-success/10 rounded-xl">
                      <p className="text-2xl mb-2">🎉</p>
                      <p className="text-success font-bold">今日已完成！</p>
                      <p className="text-text-light text-sm">明天再来吧</p>
                    </div>
                  ) : (
                    <motion.button
                      className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg ${
                        cooldown > 0 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-primary to-highlight text-white'
                      }`}
                      whileHover={cooldown === 0 ? { scale: 1.02 } : {}}
                      whileTap={cooldown === 0 ? { scale: 0.98 } : {}}
                      onClick={handlePractice}
                      disabled={cooldown > 0}
                    >
                      {cooldown > 0 ? (
                        <span>⏱ {cooldown}秒后可再次练习</span>
                      ) : (
                        <span>🎸 完成练习</span>
                      )}
                    </motion.button>
                  )}
                  
                  {/* 返回按钮 */}
                  <button
                    className="w-full mt-3 py-2 bg-surface2 text-text rounded-xl font-semibold"
                    onClick={() => navigate('/')}
                  >
                    🏠 返回首页
                  </button>
                </div>
              </div>

              {/* 中间 - 谱子 */}
              <div className="flex-1">
                <div className="bg-white rounded-2xl p-4 shadow-lg">
                  <h2 className="font-bold text-text flex items-center gap-2 mb-3">
                    <span>📜</span> 跟弹谱子
                  </h2>
                  <SheetView sheet={practice.sheet} />
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
