import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { practices as initialPractices } from '../data/courses'
import type { Practice, PracticeStatus } from '../data/types'
import SheetView from '../components/SheetView'

export default function Admin() {
  const navigate = useNavigate()
  const [practices, setPractices] = useState(initialPractices)
  const [editingPractice, setEditingPractice] = useState<Practice | null>(null)
  const [showForm, setShowForm] = useState(false)

  // 表单状态
  const [practiceName, setPracticeName] = useState('')
  const [practiceEmoji, setPracticeEmoji] = useState('🌟')
  const [practiceDate, setPracticeDate] = useState('')
  const [practiceSheet, setPracticeSheet] = useState<Practice['sheet']>(undefined)

  const startNewPractice = () => {
    setEditingPractice(null)
    setPracticeName('')
    setPracticeEmoji('🌟')
    setPracticeDate('')
    setPracticeSheet(undefined)
    setShowForm(true)
  }

  const startEditPractice = (practice: Practice) => {
    setEditingPractice(practice)
    setPracticeName(practice.title)
    setPracticeEmoji(practice.emoji)
    setPracticeDate(practice.date)
    setPracticeSheet(practice.sheet)
    setShowForm(true)
  }

  const savePractice = () => {
    if (!practiceName.trim()) {
      alert('请输入练习名称')
      return
    }
    if (!practiceDate.trim()) {
      alert('请输入日期')
      return
    }

    if (editingPractice) {
      setPractices(prev => prev.map(p => 
        p.id === editingPractice.id 
          ? { ...p, title: practiceName, emoji: practiceEmoji, date: practiceDate, sheet: practiceSheet }
          : p
      ))
      alert('练习已更新')
    } else {
      const newPractice: Practice = {
        id: `practice-${Date.now()}`,
        title: practiceName,
        emoji: practiceEmoji,
        coverColor: '#FFB347',
        date: practiceDate,
        sheet: practiceSheet,
        status: 'pending',
        attempts: 0,
      }
      setPractices(prev => [...prev, newPractice])
      alert('练习已添加')
    }
    setShowForm(false)
  }

  const deletePractice = (practiceId: string) => {
    if (confirm('确定删除这个练习吗？')) {
      setPractices(prev => prev.filter(p => p.id !== practiceId))
      if (editingPractice?.id === practiceId) {
        setShowForm(false)
      }
    }
  }

  const getStatusBadge = (status: PracticeStatus) => {
    if (status === 'completed') return '✅ 已完成'
    if (status === 'in_progress') return '🔄 练习中'
    return '○ 待练习'
  }

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
          <h1 className="font-heading text-xl text-text">⚙️ 练习管理</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* 练习列表 */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg text-text">📚 练习列表</h2>
            <button
              className="px-4 py-2 bg-primary text-white rounded-xl text-sm"
              onClick={startNewPractice}
            >
              ➕ 新建练习
            </button>
          </div>
          <div className="space-y-4">
            {practices.map(practice => (
              <motion.div
                key={practice.id}
                className={`bg-surface rounded-2xl p-4 shadow ${
                  editingPractice?.id === practice.id ? 'ring-4 ring-primary' : ''
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{practice.emoji}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text">{practice.title}</h3>
                    <p className="text-text-light text-sm flex items-center gap-2">
                      📅 {practice.date}
                      <span className="ml-2">{getStatusBadge(practice.status)}</span>
                      {practice.sheet?.imageUrl && <span>• 🎼 有谱子</span>}
                    </p>
                  </div>
                  <button
                    className="px-3 py-1 bg-secondary text-white rounded-lg text-sm"
                    onClick={() => startEditPractice(practice)}
                  >
                    编辑
                  </button>
                  <button
                    className="px-3 py-1 bg-error/20 text-error rounded-lg text-sm"
                    onClick={() => deletePractice(practice.id)}
                  >
                    删除
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 编辑/新建练习表单 */}
        {showForm && (
          <section className="bg-surface rounded-2xl p-6 shadow-lg">
            <h2 className="font-heading text-lg text-text mb-4">
              {editingPractice ? '✏️ 编辑练习' : '➕ 新建练习'}
            </h2>

            {/* 练习名称 */}
            <div className="mb-4">
              <label className="block text-text font-semibold mb-2">练习名称</label>
              <input
                type="text"
                value={practiceName}
                onChange={(e) => setPracticeName(e.target.value)}
                placeholder="例如：认识吉他"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* 日期 */}
            <div className="mb-4">
              <label className="block text-text font-semibold mb-2">日期</label>
              <input
                type="date"
                value={practiceDate}
                onChange={(e) => setPracticeDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* 图标 */}
            <div className="mb-4">
              <label className="block text-text font-semibold mb-2">图标</label>
              <div className="flex gap-3">
                {['🌟', '🎸', '🎵', '🎶', '🎤', '🎹', '🪗', '🎼'].map(emoji => (
                  <button
                    key={emoji}
                    className={`w-12 h-12 text-2xl rounded-xl ${
                      practiceEmoji === emoji ? 'bg-primary ring-2 ring-primary' : 'bg-surface2'
                    }`}
                    onClick={() => setPracticeEmoji(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* 谱子 */}
            <div className="mb-6">
              <label className="block text-text font-semibold mb-2">🎼 谱子</label>
              <SheetView 
                sheet={practiceSheet}
                editable={true}
                onSheetChange={(sheet) => setPracticeSheet(sheet)}
              />
            </div>

            <div className="flex gap-3">
              <button
                className="flex-1 py-3 bg-primary text-white rounded-xl font-bold"
                onClick={savePractice}
              >
                保存练习
              </button>
              <button
                className="px-6 py-3 bg-surface2 text-text rounded-xl font-semibold"
                onClick={() => setShowForm(false)}
              >
                取消
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
