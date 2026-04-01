import { useState, useRef } from 'react'
import type { SheetSource } from '../data/types'

interface SheetViewProps {
  sheet?: SheetSource
  onSheetChange?: (sheet: SheetSource) => void
  editable?: boolean
}

export default function SheetView({ sheet, onSheetChange, editable = false }: SheetViewProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(sheet?.imageUrl ?? null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      alert('请选择图片文件（JPG/PNG）或 PDF')
      return
    }

    const url = URL.createObjectURL(file)
    setImageUrl(url)
    onSheetChange?.({
      type: 'upload',
      localPath: url,
      imageUrl: url,
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
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
    <div className="bg-surface rounded-2xl overflow-hidden shadow-lg">
      {/* 上传/编辑模式 */}
      {editable && (
        <div className="p-4 border-b border-gray-100">
          {/* 拖拽上传区 */}
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
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
            <p className="text-text-light text-sm mb-2">或粘贴图片/谱子网址：</p>
            <input
              type="url"
              placeholder="https://..."
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              onChange={handlePasteUrl}
            />
          </div>


        </div>
      )}

      {/* 谱子显示区 */}
      {imageUrl && (
        <div className="p-2">
          {sheet?.localPath?.endsWith('.pdf') || sheet?.imageUrl?.endsWith('.pdf') ? (
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
  )
}
