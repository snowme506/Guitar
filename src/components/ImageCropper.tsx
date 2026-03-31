import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface ImageCropperProps {
  imageUrl: string
  onCrop: (blob: Blob) => void
  onCancel: () => void
}

export default function ImageCropper({ imageUrl, onCrop, onCancel }: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [scale, setScale] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imageRef.current = img
      setLoading(false)
      drawCanvas()
    }
    img.onerror = () => {
      alert('图片加载失败')
      onCancel()
    }
    img.src = imageUrl
  }, [imageUrl])

  const drawCanvas = () => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置画布大小
    const maxSize = 400
    const scaleRatio = Math.min(maxSize / img.width, maxSize / img.height, 1)
    canvas.width = img.width * scaleRatio
    canvas.height = img.height * scaleRatio

    // 绘制图片
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  }

  const handleCrop = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob((blob) => {
      if (blob) {
        onCrop(blob)
      }
    }, 'image/jpeg', 0.9)
  }

  const handleScaleChange = (newScale: number) => {
    setScale(newScale)
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const maxSize = 400 * newScale
    const scaleRatio = Math.min(maxSize / img.width, maxSize / img.height, 1)
    canvas.width = img.width * scaleRatio
    canvas.height = img.height * scaleRatio
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 z-50 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* 头部 */}
      <div className="bg-surface p-4 flex items-center justify-between">
        <button
          className="px-4 py-2 text-text"
          onClick={onCancel}
        >
          取消
        </button>
        <h2 className="font-heading text-lg">📐 调整谱子</h2>
        <button
          className="px-4 py-2 bg-primary text-white rounded-xl"
          onClick={handleCrop}
        >
          完成
        </button>
      </div>

      {/* 画布 */}
      <div className="flex-1 flex items-center justify-center p-4">
        {loading ? (
          <div className="text-white">加载中...</div>
        ) : (
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-full rounded-lg shadow-2xl"
          />
        )}
      </div>

      {/* 缩放控制 */}
      <div className="bg-surface p-4 border-t">
        <div className="flex items-center gap-4">
          <span className="text-text text-sm">缩小</span>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={scale}
            onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
            className="flex-1"
          />
          <span className="text-text text-sm">放大</span>
        </div>
        <p className="text-center text-text-light text-sm mt-2">
          当前: {Math.round(scale * 100)}%
        </p>
      </div>
    </motion.div>
  )
}
