import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { courses } from '../data/courses'
import type { Course } from '../data/types'
import SheetView from '../components/SheetView'
import SheetSearchWebView from '../components/SheetSearchWebView'

export default function Admin() {
  const navigate = useNavigate()
  const [showSheetSearch, setShowSheetSearch] = useState(false)
  const [_editingCourse, setEditingCourse] = useState<Course | null>(null)

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 顶部导航 */}
      <header className="bg-surface shadow-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            className="w-10 h-10 rounded-full bg-surface2 flex items-center justify-center text-xl"
            onClick={() => navigate('/')}
          >
            ←
          </button>
          <h1 className="font-heading text-xl text-text">⚙️ 课程管理</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* 课程列表 */}
        <section className="mb-8">
          <h2 className="font-heading text-lg text-text mb-4">📚 课程列表</h2>
          <div className="space-y-4">
            {courses.map(course => (
              <motion.div
                key={course.id}
                className="bg-surface rounded-2xl p-4 shadow"
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{course.emoji}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text">{course.title}</h3>
                    <p className="text-text-light text-sm">
                      {course.lessons.length} 课时
                    </p>
                  </div>
                  <button
                    className="px-4 py-2 bg-primary text-white rounded-xl text-sm"
                    onClick={() => setEditingCourse(course)}
                  >
                    编辑
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 添加新课程 */}
        <section>
          <h2 className="font-heading text-lg text-text mb-4">➕ 添加新课程</h2>
          <motion.div
            className="bg-surface rounded-2xl p-6 shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* 课程信息 */}
            <div className="mb-6">
              <label className="block text-text font-semibold mb-2">课程名称</label>
              <input
                type="text"
                placeholder="例如：入门课程"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* 谱子来源 */}
            <div className="mb-6">
              <label className="block text-text font-semibold mb-2">🎼 谱子</label>
              <SheetView 
                editable={true}
                onSheetChange={(sheet) => console.log('Sheet changed:', sheet)}
              />
              <button
                className="mt-2 w-full py-2 bg-secondary text-white rounded-xl"
                onClick={() => setShowSheetSearch(true)}
              >
                🔍 从网络搜索谱子
              </button>
            </div>

            {/* 提交按钮 */}
            <button className="w-full py-3 bg-primary text-white rounded-xl font-bold text-lg">
              保存课程
            </button>
          </motion.div>
        </section>
      </main>

      {/* WebView 搜索 */}
      <SheetSearchWebView
        isOpen={showSheetSearch}
        onClose={() => setShowSheetSearch(false)}
        onSelectSheet={(url) => {
          console.log('Selected sheet:', url)
        }}
      />
    </div>
  )
}
