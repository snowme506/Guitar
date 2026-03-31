import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type RecordState = 'idle' | 'countdown' | 'recording' | 'processing' | 'done'

interface RecordButtonProps {
  onRecordingComplete?: (blob: Blob, url: string) => void
  maxDuration?: number // 秒
}

export default function RecordButton({ 
  onRecordingComplete,
  maxDuration = 60 
}: RecordButtonProps) {
  const [state, setState] = useState<RecordState>('idle')
  const [countdown, setCountdown] = useState(3)
  const [duration, setDuration] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)

  // 清理
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const startCountdown = async () => {
    setState('countdown')
    setCountdown(3)
    
    // 倒计时
    for (let i = 3; i > 0; i--) {
      setCountdown(i)
      await new Promise(r => setTimeout(r, 1000))
    }
    
    // 开始录音
    await startRecording()
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        onRecordingComplete?.(blob, url)
        setState('done')
        stream.getTracks().forEach(t => t.stop())
      }

      mediaRecorder.start()
      setState('recording')
      setDuration(0)

      // 计时
      timerRef.current = window.setInterval(() => {
        setDuration(d => {
          if (d >= maxDuration) {
            stopRecording()
            return d
          }
          return d + 1
        })
      }, 1000)

    } catch (err) {
      console.error('录音失败:', err)
      alert('无法访问麦克风，请检查权限设置')
      setState('idle')
    }
  }

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    setState('processing')
  }

  const reset = () => {
    setState('idle')
    setDuration(0)
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <div className="flex flex-col items-center gap-4">
      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.button
            key="idle"
            className="w-32 h-32 rounded-full bg-error text-white text-2xl font-bold shadow-lg flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startCountdown}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            🎤 开始录音
          </motion.button>
        )}

        {state === 'countdown' && (
          <motion.div
            key="countdown"
            className="w-32 h-32 rounded-full bg-error/80 text-white text-6xl font-bold flex items-center justify-center"
            initial={{ scale: 0.5 }}
            animate={{ scale: [0.5, 1.2, 1] }}
            exit={{ scale: 0 }}
          >
            {countdown}
          </motion.div>
        )}

        {state === 'recording' && (
          <motion.div
            key="recording"
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.button
              className="w-32 h-32 rounded-full bg-error text-white text-2xl font-bold shadow-lg flex items-center justify-center animate-pulse-record"
              whileTap={{ scale: 0.9 }}
              onClick={stopRecording}
            >
              ⏹ 停止
            </motion.button>
            
            {/* 录音时长 */}
            <div className="text-center">
              <p className="text-3xl font-bold text-error">{formatTime(duration)}</p>
              <p className="text-text-light text-sm">/ {formatTime(maxDuration)}</p>
            </div>

            {/* 跳动音符 */}
            <div className="flex gap-2">
              {['🎵', '🎶', '♪', '♫'].map((note, i) => (
                <motion.span
                  key={note}
                  className="text-2xl"
                  animate={{ y: [-5, -15, -5], rotate: [-10, 10, -10] }}
                  transition={{ 
                    duration: 0.5, 
                    repeat: Infinity, 
                    delay: i * 0.1 
                  }}
                >
                  {note}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {state === 'processing' && (
          <motion.div
            key="processing"
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin-slow" />
            </div>
            <p className="text-text font-semibold">分析中...</p>
          </motion.div>
        )}

        {state === 'done' && (
          <motion.div
            key="done"
            className="flex flex-col items-center gap-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <div className="w-32 h-32 rounded-full bg-success text-white text-5xl flex items-center justify-center">
              ✓
            </div>
            <p className="text-success font-bold">录音完成！</p>
            <button
              className="px-6 py-2 bg-surface2 text-text rounded-xl font-semibold"
              onClick={reset}
            >
              再录一次
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
