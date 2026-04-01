import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SheetSearchWebViewProps {
  isOpen: boolean
  onClose: () => void
  onSelectSheet?: (url: string) => void
}

const searchEngines = [
  { name: 'Ultimate Guitar', url: 'https://ultimate-guitar.com', emoji: '🎸' },
  { name: 'Chordify', url: 'https://chordify.net', emoji: '🎵' },
  { name: 'Guitar.com', url: 'https://guitar.com', emoji: '🎶' },
]

export default function SheetSearchWebView({ 
  isOpen, 
  onClose,
  onSelectSheet 
}: SheetSearchWebViewProps) {
  const [selectedEngine, setSelectedEngine] = useState(searchEngines[0])
  const [customUrl, setCustomUrl] = useState('')
  const [iframeUrl, setIframeUrl] = useState<string | null>(null)
  const [showIframe, setShowIframe] = useState(false)

  const openInWebView = (url: string) => {
    setIframeUrl(url)
    setShowIframe(true)
  }

  const handleClose = () => {
    setShowIframe(false)
    setIframeUrl(null)
    setCustomUrl('')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="bg-background w-full h-full max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 头部 */}
            <div className="bg-surface p-4 border-b flex items-center justify-between">
              <h2 className="font-heading text-xl text-text">🔍 搜索谱子</h2>
              <button
                className="w-10 h-10 rounded-full bg-surface2 flex items-center justify-center text-2xl"
                onClick={handleClose}
              >
                ✕
              </button>
            </div>

            {/* 内容 */}
            <div className="flex-1 overflow-hidden flex">
              {!showIframe ? (
                /* 搜索引擎选择 */
                <div className="flex-1 p-6 overflow-y-auto">
                  <p className="text-text-light mb-4">选择一个网站搜索吉他谱：</p>
                  
                  <div className="space-y-3">
                    {searchEngines.map((engine) => (
                      <motion.button
                        key={engine.name}
                        className={`w-full p-4 rounded-xl text-left flex items-center gap-3 ${
                          selectedEngine.name === engine.name
                            ? 'bg-primary text-white'
                            : 'bg-surface hover:bg-surface2'
                        }`}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedEngine(engine)
                          openInWebView(engine.url)
                        }}
                      >
                        <span className="text-3xl">{engine.emoji}</span>
                        <span className="font-semibold">{engine.name}</span>
                      </motion.button>
                    ))}
                  </div>

                  {/* 自定义 URL */}
                  <div className="mt-6 pt-6 border-t">
                    <p className="text-text-light mb-3">或输入网址：</p>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        className="px-6 py-2 bg-primary text-white rounded-xl font-semibold"
                        onClick={() => customUrl && openInWebView(customUrl)}
                      >
                        打开
                      </button>
                    </div>
                  </div>

                  {/* 使用提示 */}
                  <div className="mt-6 p-4 bg-surface2 rounded-xl">
                    <p className="text-sm text-text-light">
                      💡 <strong>提示：</strong>在网站上找到想要的谱子后，复制图片地址或网页链接，
                      然后点击下方按钮粘贴回来。
                    </p>
                  </div>

                  <button
                    className="mt-4 w-full py-3 bg-accent text-white rounded-xl font-semibold"
                    onClick={() => {
                      const url = window.prompt('请粘贴谱子图片或网页的网址：')
                      if (url) {
                        onSelectSheet?.(url)
                        handleClose()
                      }
                    }}
                  >
                    📋 粘贴谱子链接
                  </button>
                </div>
              ) : (
                /* iframe 内嵌浏览 */
                <div className="flex-1 flex flex-col">
                  {/* URL 栏 */}
                  <div className="bg-surface p-3 border-b flex items-center gap-2">
                    <button
                      className="px-3 py-1 bg-surface2 rounded-lg text-sm"
                      onClick={() => setShowIframe(false)}
                    >
                      ← 返回
                    </button>
                    <input
                      type="url"
                      value={iframeUrl ?? ''}
                      onChange={(e) => setIframeUrl(e.target.value)}
                      className="flex-1 px-4 py-1 bg-surface2 rounded-lg text-sm"
                    />
                    <button
                      className="px-3 py-1 bg-primary text-white rounded-lg text-sm"
                      onClick={() => iframeUrl && openInWebView(iframeUrl)}
                    >
                      跳转
                    </button>
                  </div>

                  {/* iframe 内容 */}
                  <div className="flex-1 bg-white">
                    <iframe
                      src={iframeUrl ?? ''}
                      className="w-full h-full border-0"
                      title="谱子搜索"
                      sandbox="allow-scripts allow-same-origin allow-forms"
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
