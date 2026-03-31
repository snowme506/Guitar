import { useState, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import type { SheetSource } from '../data/types'
import ImageCropper from './ImageCropper'

interface SheetViewProps {
  sheet?: SheetSource
  editable?: boolean
  onSheetChange?: (sheet: SheetSource) => void
}

export default function SheetView({ sheet, editable = false, onSheetChange }: SheetViewProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(sheet?.imageUrl ?? null)
  const [isDragging, setIsDragging] = useState(false)
  const [showCropper, setShowCropper] = useState(false)
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      alert('请选择图片文件（JPG/PNG）或 PDF')
      return
    }

    const url = URL.createObjectURL(file)
    if (file.type.startsWith('image/')) {
      // 图片进入裁剪
      setTempImageUrl(url)
      setShowCropper(true)
    } else {
      // PDF 直接显示
      setImageUrl(url)
      onSheetChange?.({
        type: 'upload',
        localPath: url,
        imageUrl: url,
      })
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleCrop = (blob: Blob) => {
    const url = URL.createObjectURL(blob)
    setImageUrl(url)
    onSheetChange?.({
      type: 'upload',
      localPath: url,
      imageUrl: url,
    })
    setShowCropper(false)
    setTempImageUrl(null)
  }

  const handlePasteUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value.trim()
    if (url) {
      setImageUrl(url)
      onSheetChange?.({
        type: 'url',
        imageUrl: url,
      })
    }
  }

  if (!editable && !imageUrl) {
    return (
      <div className="bg-surface2 rounded-2xl p-8 text-center">
        <p className="text-4xl mb-4">🎼</p>
        <p className="text-text">暂无谱子</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-surface rounded-2xl overflow-hidden shadow-lg">
        {/* 上传/编辑模式 */}
        {editable && (
          <div className="p-4 border-b border-gray-100">
            {/* 拖拽上传区 */}
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                isDragging ? 'border-primary bg-primary/10' : 'border-gray-300'
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <p className="text-3xl mb-2">📷</p>
              <p className="text-text font-semibold">
                {isDragging ? '放开上传' : '点击上传谱子图片'}
              </p>
              <p className="text-text-light text-sm mt-1">支持 JPG、PNG、PDF</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileSelect(file)
                }}
              />
            </div>

            {/* 或粘贴 URL */}
            <div className="mt-4">
              <p className="text-text-light text-sm mb-2">或粘贴图片网址：</p>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  onChange={handlePasteUrl}
                />
                <button
                  className="px-4 py-2 bg-secondary text-white rounded-xl"
                  onClick={() => {
                    const url = window.prompt('粘贴谱子图片网址：')
                    if (url) handlePasteUrl({ target: { value: url } } as any)
                  }}
                >
                  粘贴
                </button>
              </div>
            </div>

            {/* 已上传图片操作 */}
            {imageUrl && (
              <div className="mt-4 flex gap-2">
                <button
                  className="flex-1 py-2 bg-surface2 text-text rounded-xl text-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  📷 重新上传
                </button>
                <button
                  className="flex-1 py-2 bg-surface2 text-text rounded-xl text-sm"
                  onClick={() => {
                    setTempImageUrl(imageUrl)
                    setShowCropper(true)
                  }}
                >
                  📐 裁剪/调整
                </button>
                <button
                  className="px-4 py-2 bg-error/20 text-error rounded-xl text-sm"
                  onClick={() => {
                    setImageUrl(null)
                    onSheetChange?.({ type: 'upload' })
                  }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}

        {/* 谱子显示区 */}
        {imageUrl && (
          <div className="p-2">
            {imageUrl.toLowerCase().endsWith('.pdf') || sheet?.localPath?.toLowerCase().endsWith('.pdf') ? (
              <embed
                src={imageUrl}
                type="application/pdf"
                className="w-full h-96 rounded-lg"
              />
            ) : (
              <img
                src={imageUrl}
                alt="谱子"
                className="w-full h-auto rounded-lg"
                style={{ maxHeight: '500px', objectFit: 'contain' }}
              />
            )}
          </div>
        )}
      </div>

      {/* 裁剪弹窗 */}
      <AnimatePresence>
        {showCropper && tempImageUrl && (
          <ImageCropper
            imageUrl={tempImageUrl}
            onCrop={handleCrop}
            onCancel={() => {
              setShowCropper(false)
              setTempImageUrl(null)
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}
