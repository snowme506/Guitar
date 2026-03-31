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
    name: 'SheetsDB', 
    url: 'https://sheetsdb.com', 
    emoji: '🎼',
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

  const handleSearch = () => {
    if (!songName.trim()) {
      alert('请输入歌曲名称')
      return
    }
    
    const encodedSong = encodeURIComponent(songName.trim())
    const searchUrl = `${selectedEngine.url}${selectedEngine.searchPath}${encodedSong}`
    
    // 直接在浏览器打开
    window.open(searchUrl, '_blank')
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
          onClick={onClose}
        >
          <motion.div
            className="bg-background w-full max-w-md mx-4 rounded-2xl overflow-hidden shadow-2xl"
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
                onClick={onClose}
              >
                ✕
              </button>
            </div>

            {/* 内容 */}
            <div className="p-6">
              {/* 歌曲名输入 */}
              <div className="mb-4">
                <label className="block text-text font-semibold mb-2">歌曲名称</label>
                <input
                  type="text"
                  value={songName}
                  onChange={(e) => setSongName(e.target.value)}
                  placeholder="输入歌曲名，如：小星星"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-lg"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              {/* 选择搜索引擎 */}
              <p className="text-text-light mb-3 text-sm">选择搜索网站：</p>
              <div className="space-y-2 mb-6">
                {searchEngines.map((engine) => (
                  <motion.button
                    key={engine.name}
                    className={`w-full p-3 rounded-xl text-left flex items-center gap-3 ${
                      selectedEngine.name === engine.name
                        ? 'bg-primary text-white'
                        : 'bg-surface hover:bg-surface2'
                    }`}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedEngine(engine)}
                  >
                    <span className="text-2xl">{engine.emoji}</span>
                    <span className="font-semibold">{engine.name}</span>
                  </motion.button>
                ))}
              </div>

              {/* 搜索按钮 */}
              <button
                className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg"
                onClick={handleSearch}
              >
                🔍 在浏览器中搜索
              </button>

              {/* 提示 */}
              <div className="mt-4 p-3 bg-surface2 rounded-xl">
                <p className="text-xs text-text-light">
                  💡 搜索后，在浏览器中找到谱子图片，长按复制图片地址，
                  然后回来点击下方按钮粘贴。
                </p>
              </div>

              {/* 粘贴网址 */}
              <button
                className="w-full mt-3 py-3 bg-accent text-white rounded-xl font-semibold"
                onClick={() => {
                  const url = window.prompt('粘贴谱子图片网址：')
                  if (url) {
                    onSelectSheet?.(url)
                    onClose()
                  }
                }}
              >
                📋 粘贴谱子链接
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
