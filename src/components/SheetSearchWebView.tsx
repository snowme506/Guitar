import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SheetSearchWebViewProps {
  isOpen: boolean
  onClose: () => void
  onSelectSheet?: (url: string) => void
}

const searchEngines = [
  { 
    name: 'Ultimate Guitar', 
    url: 'https://www.ultimate-guitar.com', 
    emoji: '🎸',
    searchPath: '/search.php?type=300'
  },
  { 
    name: 'Chordify', 
    url: 'https://chordify.net', 
    emoji: '🎵',
    searchPath: '/searches/'
  },
  { 
    name: 'Guitar.com', 
    url: 'https://guitar.com', 
    emoji: '🎶',
    searchPath: '/?s='
  },
]

export default function SheetSearchWebView({ 
  isOpen, 
  onClose,
  onSelectSheet 
}: SheetSearchWebViewProps) {
  const [selectedEngine, setSelectedEngine] = useState(searchEngines[0])
  const [songName, setSongName] = useState('')
  const [showIframe, setShowIframe] = useState(false)
  const [iframeUrl, setIframeUrl] = useState<string | null>(null)

  const handleSearch = () => {
    if (!songName.trim()) {
      alert('请输入歌曲名称')
      return
    }
    
    const encodedSong = encodeURIComponent(songName.trim())
    const searchUrl = `${selectedEngine.url}${selectedEngine.searchPath}${encodedSong}`
    setIframeUrl(searchUrl)
    setShowIframe(true)
  }

  const handleClose = () => {
    setShowIframe(false)
    setIframeUrl(null)
    setSongName('')
    onClose()
  }

  const handleSelectCurrentUrl = () => {
    if (iframeUrl) {
      onSelectSheet?.(iframeUrl)
      handleClose()
    }
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
            <div className="flex-1 overflow-hidden flex flex-col">
              {!showIframe ? (
                /* 搜索界面 */
                <div className="flex-1 p-6 overflow-y-auto">
                  {/* 歌曲名输入 */}
                  <div className="mb-6">
                    <label className="block text-text font-semibold mb-2">歌曲名称</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={songName}
                        onChange={(e) => setSongName(e.target.value)}
                        placeholder="输入歌曲名，如：小星星"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-lg"
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      />
                      <button
                        className="px-6 py-3 bg-primary text-white rounded-xl font-semibold text-lg"
                        onClick={handleSearch}
                      >
                        搜索
                      </button>
                    </div>
                  </div>

                  {/* 选择搜索引擎 */}
                  <p className="text-text-light mb-3">选择搜索网站：</p>
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
                        onClick={() => setSelectedEngine(engine)}
                      >
                        <span className="text-3xl">{engine.emoji}</span>
                        <span className="font-semibold">{engine.name}</span>
                      </motion.button>
                    ))}
                  </div>

                  {/* 提示 */}
                  <div className="mt-6 p-4 bg-surface2 rounded-xl">
                    <p className="text-sm text-text-light">
                      💡 <strong>提示：</strong>搜索到谱子后，点击"使用此谱子"按钮即可。
                      也可以复制网页地址粘贴回来。
                    </p>
                  </div>
                </div>
              ) : (
                /* 浏览器内嵌界面 */
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
                      onClick={() => iframeUrl && setIframeUrl(iframeUrl)}
                    >
                      跳转
                    </button>
                  </div>

                  {/* iframe 内容 */}
                  <div className="flex-1 bg-white relative">
                    <iframe
                      src={iframeUrl ?? ''}
                      className="w-full h-full border-0"
                      title="谱子搜索"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    />
                    
                    {/* 底部操作栏 */}
                    <div className="absolute bottom-0 left-0 right-0 bg-surface border-t p-3 flex gap-3">
                      <button
                        className="flex-1 py-3 bg-accent text-white rounded-xl font-semibold"
                        onClick={handleSelectCurrentUrl}
                      >
                        ✓ 使用此谱子
                      </button>
                      <button
                        className="px-6 py-3 bg-surface2 text-text rounded-xl font-semibold"
                        onClick={() => {
                          const url = window.prompt('或粘贴谱子网址：')
                          if (url) {
                            onSelectSheet?.(url)
                            handleClose()
                          }
                        }}
                      >
                        粘贴网址
                      </button>
                    </div>
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
