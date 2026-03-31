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
  const [displaySize, setDisplaySize] = useState({ width: 300, height: 200 })
  const [cropArea, setCropArea] = useState({ x: 10, y: 10, w: 80, h: 80 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragType, setDragType] = useState<'move' | 'resize' | null>(null)
  const [dragCorner, setDragCorner] = useState<string | null>(null)
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      setImg(image)
      if (containerRef.current) {
        const maxW = Math.min(containerRef.current.clientWidth - 32, 400)
        const ratio = Math.min(maxW / image.width, 300 / image.height, 1)
        setDisplaySize({
          width: image.width * ratio,
          height: image.height * ratio
        })
        setCropArea({ x: 5, y: 5, w: 90, h: 90 })
      }
    }
    image.onerror = () => {
      alert('图片加载失败')
      onCancel()
    }
    image.src = imageUrl
  }, [imageUrl, onCancel])

  const getEventPos = (e: MouseEvent | TouchEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    
    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0]
      return {
        x: (touch.clientX - rect.left) * (displaySize.width / rect.width),
        y: (touch.clientY - rect.top) * (displaySize.height / rect.height)
      }
    }
    return {
      x: (e.clientX - rect.left) * (displaySize.width / rect.width),
      y: (e.clientY - rect.top) * (displaySize.height / rect.height)
    }
  }

  const handleStart = (e: React.MouseEvent | React.TouchEvent, type: 'move' | 'resize', corner?: string) => {
    e.preventDefault()
    const pos = getEventPos(e.nativeEvent)
    setIsDragging(true)
    setDragType(type)
    setDragCorner(corner || null)
    setLastPos(pos)
  }

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !dragType) return

    const pos = getEventPos(e.nativeEvent)
    const dx = pos.x - lastPos.x
    const dy = pos.y - lastPos.y

    if (dragType === 'move') {
      setCropArea(prev => ({
        ...prev,
        x: Math.max(0, Math.min(100 - prev.w, prev.x + dx)),
        y: Math.max(0, Math.min(100 - prev.h, prev.y + dy))
      }))
    } else if (dragType === 'resize' && dragCorner) {
      const minSize = 15
      let newX = cropArea.x
      let newY = cropArea.y
      let newW = cropArea.w
      let newH = cropArea.h

      if (dragCorner.includes('e')) {
        newW = Math.max(minSize, Math.min(100 - newX, cropArea.w + dx))
      }
      if (dragCorner.includes('w')) {
        const proposedX = cropArea.x + dx
        if (proposedX >= 0 && proposedX < cropArea.x + cropArea.w - minSize) {
          newX = proposedX
          newW = cropArea.w - dx
        }
      }
      if (dragCorner.includes('s')) {
        newH = Math.max(minSize, Math.min(100 - newY, cropArea.h + dy))
      }
      if (dragCorner.includes('n')) {
        const proposedY = cropArea.y + dy
        if (proposedY >= 0 && proposedY < cropArea.y + cropArea.h - minSize) {
          newY = proposedY
          newH = cropArea.h - dy
        }
      }

      setCropArea({ x: newX, y: newY, w: newW, h: newH })
    }

    setLastPos(pos)
  }

  const handleEnd = () => {
    setIsDragging(false)
    setDragType(null)
    setDragCorner(null)
  }

  const handleCrop = () => {
    if (!img || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

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
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
        <div 
          className="relative"
          style={{ width: displaySize.width, height: displaySize.height }}
        >
          {/* 原图 */}
          <img
            src={imageUrl}
            alt="裁剪"
            className="absolute top-0 left-0"
            style={{ width: displaySize.width, height: displaySize.height }}
            draggable={false}
          />

          {/* 半透明遮罩 - 用 SVG 实现 */}
          <svg
            className="absolute top-0 left-0 w-full h-full"
            style={{ width: displaySize.width, height: displaySize.height }}
          >
            <defs>
              <mask id="cropMask">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                <rect
                  x={`${cropArea.x}%`}
                  y={`${cropArea.y}%`}
                  width={`${cropArea.w}%`}
                  height={`${cropArea.h}%`}
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              x="0" y="0" width="100%" height="100%"
              fill="rgba(0,0,0,0.5)"
              mask="url(#cropMask)"
            />
          </svg>

          {/* 裁剪框 */}
          <div
            className="absolute border-2 border-white cursor-move"
            style={{
              left: `${cropArea.x}%`,
              top: `${cropArea.y}%`,
              width: `${cropArea.w}%`,
              height: `${cropArea.h}%`,
            }}
            onMouseDown={(e) => handleStart(e, 'move')}
            onTouchStart={(e) => handleStart(e, 'move')}
          >
            {/* 四个边角调整手柄 */}
            {['nw', 'ne', 'sw', 'se'].map((corner) => (
              <div
                key={corner}
                className="absolute w-5 h-5 bg-white rounded-full border-2 border-primary"
                style={{
                  cursor: 'nwse-resize',
                  ...(corner === 'nw' && { top: -10, left: -10 }) ||
                  (corner === 'ne' && { top: -10, right: -10 }) ||
                  (corner === 'sw' && { bottom: -10, left: -10 }) ||
                  (corner === 'se' && { bottom: -10, right: -10 })
                }}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  handleStart(e, 'resize', corner)
                }}
                onTouchStart={(e) => {
                  e.stopPropagation()
                  handleStart(e, 'resize', corner)
                }}
              />
            ))}

            {/* 网格线 */}
            <div className="absolute inset-0 flex flex-col justify-around pointer-events-none">
              {[1, 2].map((i) => (
                <div key={i} className="w-full h-px bg-white/50" />
              ))}
            </div>
            <div className="absolute inset-0 flex justify-around pointer-events-none">
              {[1, 2].map((i) => (
                <div key={i} className="h-full w-px bg-white/50" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 控制栏 */}
      <div className="bg-surface p-4 border-t">
        <p className="text-center text-text-light text-sm mb-3">
          拖动框选区域，或拖动四角调整大小
        </p>
        <button
          className="w-full py-3 bg-surface2 text-text rounded-xl font-semibold"
          onClick={() => setCropArea({ x: 5, y: 5, w: 90, h: 90 })}
        >
          重置为整张图片
        </button>
      </div>

      {/* 隐藏的画布用于裁剪 */}
      <canvas ref={canvasRef} className="hidden" />
    </motion.div>
  )
}
