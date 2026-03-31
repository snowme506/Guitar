import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface ImageCropperProps {
  imageUrl: string
  onCrop: (blob: Blob) => void
  onCancel: () => void
}

export default function ImageCropper({ imageUrl, onCrop, onCancel }: ImageCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, w: 100, h: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragType, setDragType] = useState<'move' | 'resize' | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      setImg(image)
      // 计算容器大小
      if (containerRef.current) {
        const maxW = containerRef.current.clientWidth - 32
        const maxH = containerRef.current.clientHeight - 32
        const ratio = Math.min(maxW / image.width, maxH / image.height, 1)
        setContainerSize({
          width: image.width * ratio,
          height: image.height * ratio
        })
        // 默认裁剪区域为整个图片
        setCropArea({ x: 0, y: 0, w: 100, h: 100 })
      }
    }
    image.src = imageUrl
  }, [imageUrl])

  const handleMouseDown = (e: React.MouseEvent, type: 'move' | 'resize', _corner?: string) => {
    e.preventDefault()
    setIsDragging(true)
    setDragType(type)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragType) return

    const dx = e.clientX - dragStart.x
    const dy = e.clientY - dragStart.y

    if (dragType === 'move') {
      setCropArea(prev => ({
        ...prev,
        x: Math.max(0, Math.min(100 - prev.w, prev.x + (dx / containerSize.width) * 100)),
        y: Math.max(0, Math.min(100 - prev.h, prev.y + (dy / containerSize.height) * 100))
      }))
    } else if (dragType === 'resize') {
      // 四边/角调整
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      // 简化处理：只支持下边和右边调整大小
      const newW = Math.max(20, Math.min(100, cropArea.w + (dx / containerSize.width) * 100))
      const newH = Math.max(20, Math.min(100, cropArea.h + (dy / containerSize.height) * 100))

      setCropArea(prev => ({
        ...prev,
        w: newW,
        h: newH
      }))
    }

    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDragType(null)
  }

  const handleCrop = () => {
    if (!img || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 计算实际裁剪区域
    const cropX = (cropArea.x / 100) * img.width
    const cropY = (cropArea.y / 100) * img.height
    const cropW = (cropArea.w / 100) * img.width
    const cropH = (cropArea.h / 100) * img.height

    canvas.width = cropW
    canvas.height = cropH

    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH)

    canvas.toBlob((blob) => {
      if (blob) onCrop(blob)
    }, 'image/jpeg', 0.9)
  }

  if (!img) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
        <div className="text-white">加载中...</div>
      </div>
    )
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
        <h2 className="font-heading text-lg">📐 裁剪谱子</h2>
        <button
          className="px-4 py-2 bg-primary text-white rounded-xl"
          onClick={handleCrop}
        >
          完成
        </button>
      </div>

      {/* 图片区域 */}
      <div 
        ref={containerRef}
        className="flex-1 flex items-center justify-center p-4 overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          className="relative"
          style={{ width: containerSize.width, height: containerSize.height }}
        >
          {/* 原图 */}
          <img
            src={imageUrl}
            alt="裁剪"
            className="absolute top-0 left-0"
            style={{ width: containerSize.width, height: containerSize.height }}
            draggable={false}
          />

          {/* 半透明遮罩 */}
          <div 
            className="absolute bg-black/50"
            style={{
              left: 0,
              top: 0,
              width: containerSize.width,
              height: containerSize.height,
              clipPath: `polygon(
                0% 0%, 100% 0%, 100% 100%, 0% 100%,
                0% 0%,
                ${cropArea.x}% ${cropArea.y}%,
                ${cropArea.x}% ${cropArea.y + cropArea.h}%,
                ${cropArea.x + cropArea.w}% ${cropArea.y + cropArea.h}%,
                ${cropArea.x + cropArea.w}% ${cropArea.y}%,
                ${cropArea.x}% ${cropArea.y}%
              )`
            }}
          />

          {/* 裁剪框 */}
          <div
            className="absolute border-2 border-white cursor-move"
            style={{
              left: (cropArea.x / 100) * containerSize.width,
              top: (cropArea.y / 100) * containerSize.height,
              width: (cropArea.w / 100) * containerSize.width,
              height: (cropArea.h / 100) * containerSize.height,
            }}
            onMouseDown={(e) => handleMouseDown(e, 'move')}
          >
            {/* 四个边角调整手柄 */}
            {['nw', 'ne', 'sw', 'se'].map((corner) => (
              <div
                key={corner}
                className="absolute w-4 h-4 bg-white rounded-full"
                style={{
                  cursor: 'nwse-resize',
                  ...(corner === 'nw' && { top: -8, left: -8 }) ||
                  (corner === 'ne' && { top: -8, right: -8 }) ||
                  (corner === 'sw' && { bottom: -8, left: -8 }) ||
                  (corner === 'se' && { bottom: -8, right: -8 })
                }}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  handleMouseDown(e, 'resize', corner)
                }}
              />
            ))}

            {/* 网格线 */}
            <div className="absolute inset-0 flex flex-col justify-around">
              {[1, 2].map((i) => (
                <div key={i} className="w-full h-px bg-white/50" />
              ))}
            </div>
            <div className="absolute inset-0 flex justify-around">
              {[1, 2].map((i) => (
                <div key={i} className="h-full w-px bg-white/50" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 控制栏 */}
      <div className="bg-surface p-4 border-t">
        <div className="flex items-center gap-4 mb-3">
          <span className="text-text text-sm">缩小</span>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="flex-1"
          />
          <span className="text-text text-sm">放大</span>
        </div>
        <p className="text-center text-text-light text-sm mb-3">
          拖动裁剪框调整大小和位置
        </p>
        <button
          className="w-full py-3 bg-primary text-white rounded-xl font-bold"
          onClick={() => setCropArea({ x: 0, y: 0, w: 100, h: 100 })}
        >
          重置为整张图片
        </button>
      </div>

      {/* 隐藏的画布用于裁剪 */}
      <canvas ref={canvasRef} className="hidden" />
    </motion.div>
  )
}
