import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useProgressStore } from '../stores/progressStore'
import type { Practice, PracticeStatus } from '../data/types'

const COLORS = [
  { name: '橙色', value: '#FFB347' },
  { name: '浅蓝', value: '#87CEEB' },
  { name: '浅绿', value: '#98D8AA' },
  { name: '粉红', value: '#FFB6C1' },
  { name: '淡紫', value: '#DDA0DD' },
  { name: '珊瑚色', value: '#FF7F7F' },
  { name: '天蓝', value: '#87CEFA' },
  { name: '薄荷绿', value: '#98FB98' },
]

export default function Admin() {
  const navigate = useNavigate()
  const practices = useProgressStore((s) => s.practices)
  const { addPractice, updatePractice, deletePractice } = useProgressStore()
  const updatePracticeStatus = useProgressStore((s) => s.updatePracticeStatus)
  
  const [editingPractice, setEditingPractice] = useState<Practice | null>(null)
  const [showForm, setShowForm] = useState(false)

  // 表单状态
  const [practiceName, setPracticeName] = useState('')
  const [practiceEmoji, setPracticeEmoji] = useState('🎸')
  const [practiceColor, setPracticeColor] = useState('#FFB347')
  const [practiceDate, setPracticeDate] = useState('')

  const startNewPractice = () => {
    setEditingPractice(null)
    setPracticeName('')
    setPracticeEmoji('🎸')
    setPracticeColor('#FFB347')
    setPracticeDate('')
    setShowForm(true)
  }

  const startEditPractice = (practice: Practice) => {
    setEditingPractice(practice)
    setPracticeName(practice.title)
    setPracticeEmoji(practice.emoji)
    setPracticeColor(practice.coverColor)
    setPracticeDate(practice.date)
    setShowForm(true)
  }

  const savePractice = () => {
    if (!practiceName.trim()) {
      alert('请输入课程名称')
      return
    }
    if (!practiceDate.trim()) {
      alert('请输入日期')
      return
    }

    if (editingPractice) {
      updatePractice(editingPractice.id, {
        title: practiceName,
        emoji: practiceEmoji,
        coverColor: practiceColor,
        date: practiceDate,
      })
      alert('课程已更新')
    } else {
      addPractice({
        id: `practice-${Date.now()}`,
        title: practiceName,
        emoji: practiceEmoji,
        coverColor: practiceColor,
        date: practiceDate,
      })
      alert('课程已添加')
    }
    setShowForm(false)
  }

  const handleDeletePractice = (practiceId: string) => {
    if (confirm('确定删除这个练习吗？')) {
      deletePractice(practiceId)
      if (editingPractice?.id === practiceId) {
        setShowForm(false)
      }
    }
  }

  const changeStatus = (practiceId: string, newStatus: PracticeStatus) => {
    updatePracticeStatus(practiceId, newStatus)
  }

  // 按状态分组
  const completedPractices = practices.filter(p => p.status === 'completed')
  const inProgressPractices = practices.filter(p => p.status === 'in_progress')
  const pendingPractices = practices.filter(p => p.status === 'pending')

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
        {/* 添加按钮 */}
        <motion.button
          className="w-full py-4 bg-gradient-to-r from-primary to-highlight text-white rounded-2xl font-bold text-lg shadow-lg mb-8"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={startNewPractice}
        >
          + 添加新课程
        </motion.button>

        {/* 已完成 */}
        {completedPractices.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-success text-white text-sm flex items-center justify-center">✓</span>
              已完成 ({completedPractices.length})
            </h2>
            <div className="space-y-3">
              {completedPractices.map(practice => (
                <div key={practice.id} className="bg-white rounded-xl p-4 shadow flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: practice.coverColor + '20' }}>
                    {practice.emoji}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text">{practice.title}</h3>
                    <p className="text-text-light text-sm">📅 {practice.date}</p>
                  </div>
                  <select
                    value={practice.status}
                    onChange={(e) => changeStatus(practice.id, e.target.value as PracticeStatus)}
                    className="px-3 py-1 bg-success/20 text-success rounded-lg text-sm border-0"
                  >
                    <option value="pending">未开始</option>
                    <option value="in_progress">进行中</option>
                    <option value="completed">已完成</option>
                  </select>
                  <button onClick={() => startEditPractice(practice)} className="text-2xl">✏️</button>
                  <button onClick={() => handleDeletePractice(practice.id)} className="text-2xl">🗑️</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 进行中 */}
        {inProgressPractices.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-sm flex items-center justify-center">🔄</span>
              进行中 ({inProgressPractices.length})
            </h2>
            <div className="space-y-3">
              {inProgressPractices.map(practice => (
                <div key={practice.id} className="bg-white rounded-xl p-4 shadow flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: practice.coverColor + '20' }}>
                    {practice.emoji}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text">{practice.title}</h3>
                    <p className="text-text-light text-sm">📅 {practice.date}</p>
                  </div>
                  <select
                    value={practice.status}
                    onChange={(e) => changeStatus(practice.id, e.target.value as PracticeStatus)}
                    className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-sm border-0"
                  >
                    <option value="pending">未开始</option>
                    <option value="in_progress">进行中</option>
                    <option value="completed">已完成</option>
                  </select>
                  <button onClick={() => startEditPractice(practice)} className="text-2xl">✏️</button>
                  <button onClick={() => handleDeletePractice(practice.id)} className="text-2xl">🗑️</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 未开始 */}
        {pendingPractices.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-warning text-white text-sm flex items-center justify-center">○</span>
              未开始 ({pendingPractices.length})
            </h2>
            <div className="space-y-3">
              {pendingPractices.map(practice => (
                <div key={practice.id} className="bg-white rounded-xl p-4 shadow flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: practice.coverColor + '20' }}>
                    {practice.emoji}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text">{practice.title}</h3>
                    <p className="text-text-light text-sm">📅 {practice.date}</p>
                  </div>
                  <select
                    value={practice.status}
                    onChange={(e) => changeStatus(practice.id, e.target.value as PracticeStatus)}
                    className="px-3 py-1 bg-warning/20 text-warning rounded-lg text-sm border-0"
                  >
                    <option value="pending">未开始</option>
                    <option value="in_progress">进行中</option>
                    <option value="completed">已完成</option>
                  </select>
                  <button onClick={() => startEditPractice(practice)} className="text-2xl">✏️</button>
                  <button onClick={() => handleDeletePractice(practice.id)} className="text-2xl">🗑️</button>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* 编辑/新建弹窗 */}
      {showForm && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowForm(false)}
        >
          <motion.div
            className="bg-surface rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 头部 */}
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-heading text-lg text-text">
                {editingPractice ? '编辑课程' : '添加新课程'}
              </h2>
              <button
                className="w-10 h-10 rounded-full bg-surface2 flex items-center justify-center text-xl"
                onClick={() => setShowForm(false)}
              >
                ✕
              </button>
            </div>

            {/* 表单 */}
            <div className="p-4 space-y-4">
              {/* 课程名称 */}
              <div>
                <label className="block text-text font-semibold mb-2">📝 课程名称</label>
                <input
                  type="text"
                  value={practiceName}
                  onChange={(e) => setPracticeName(e.target.value)}
                  placeholder="输入课程名称"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* 课程日期 */}
              <div>
                <label className="block text-text font-semibold mb-2">📅 课程日期</label>
                <input
                  type="date"
                  value={practiceDate}
                  onChange={(e) => setPracticeDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* 课程图标 */}
              <div>
                <label className="block text-text font-semibold mb-2">🎯 课程图标</label>
                <div className="flex gap-2 flex-wrap">
                  {['🎸', '🎹', '🥁', '🎺', '🎻', '🎵', '🎶', '🎼', '🌟', '💫', '⭐', '🎤'].map(emoji => (
                    <button
                      key={emoji}
                      className={`w-12 h-12 text-2xl rounded-xl ${
                        practiceEmoji === emoji ? 'ring-2 ring-primary' : ''
                      }`}
                      style={{ backgroundColor: practiceEmoji === emoji ? practiceColor + '40' : '#f5f5f5' }}
                      onClick={() => setPracticeEmoji(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* 卡片颜色 */}
              <div>
                <label className="block text-text font-semibold mb-2">🎨 卡片颜色</label>
                <div className="flex gap-3">
                  {COLORS.map(color => (
                    <button
                      key={color.name}
                      className={`w-10 h-10 rounded-full ${
                        color.value === '#FFB347' ? 'bg-[#FFB347]' :
                        color.value === '#87CEEB' ? 'bg-[#87CEEB]' :
                        color.value === '#98D8AA' ? 'bg-[#98D8AA]' :
                        color.value === '#FFB6C1' ? 'bg-[#FFB6C1]' :
                        color.value === '#DDA0DD' ? 'bg-[#DDA0DD]' :
                        color.value === '#FF7F7F' ? 'bg-[#FF7F7F]' :
                        color.value === '#87CEFA' ? 'bg-[#87CEFA]' :
                        'bg-[#98FB98]'
                      } ${practiceColor === color.value ? 'ring-2 ring-gray-400' : ''}`}
                      onClick={() => setPracticeColor(color.value)}
                    />
                  ))}
                </div>
              </div>

              {/* 按钮 */}
              <div className="flex gap-3 pt-4">
                <button
                  className="flex-1 py-3 bg-primary text-white rounded-xl font-bold"
                  onClick={savePractice}
                >
                  ✓ 保存课程
                </button>
                <button
                  className="px-6 py-3 bg-surface2 text-text rounded-xl font-semibold"
                  onClick={() => setShowForm(false)}
                >
                  取消
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
