import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { courses as initialCourses } from '../data/courses'
import type { Course } from '../data/types'
import SheetView from '../components/SheetView'

export default function Admin() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState(initialCourses)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [showForm, setShowForm] = useState(false)

  // 表单状态
  const [courseName, setCourseName] = useState('')
  const [courseEmoji, setCourseEmoji] = useState('🌟')
  const [courseDate, setCourseDate] = useState('')
  const [courseSheet, setCourseSheet] = useState<Course['sheet']>(undefined)

  const startNewCourse = () => {
    setEditingCourse(null)
    setCourseName('')
    setCourseEmoji('🌟')
    setCourseDate('')
    setCourseSheet(undefined)
    setShowForm(true)
  }

  const startEditCourse = (course: Course) => {
    setEditingCourse(course)
    setCourseName(course.title)
    setCourseEmoji(course.emoji)
    setCourseDate(course.date)
    setCourseSheet(course.sheet)
    setShowForm(true)
  }

  const saveCourse = () => {
    if (!courseName.trim()) {
      alert('请输入课程名称')
      return
    }
    if (!courseDate.trim()) {
      alert('请输入上课日期')
      return
    }

    if (editingCourse) {
      setCourses(prev => prev.map(c => 
        c.id === editingCourse.id 
          ? { ...c, title: courseName, emoji: courseEmoji, date: courseDate, sheet: courseSheet }
          : c
      ))
      alert('课程已更新')
    } else {
      const newCourse: Course = {
        id: `course-${Date.now()}`,
        title: courseName,
        emoji: courseEmoji,
        coverColor: '#FFB347',
        date: courseDate,
        sheet: courseSheet,
      }
      setCourses(prev => [...prev, newCourse])
      alert('课程已添加')
    }
    setShowForm(false)
  }

  const deleteCourse = (courseId: string) => {
    if (confirm('确定删除这个课程吗？')) {
      setCourses(prev => prev.filter(c => c.id !== courseId))
      if (editingCourse?.id === courseId) {
        setShowForm(false)
      }
    }
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
          <h1 className="font-heading text-xl text-text">⚙️ 课程管理</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* 课程列表 */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg text-text">📚 课程列表</h2>
            <button
              className="px-4 py-2 bg-primary text-white rounded-xl text-sm"
              onClick={startNewCourse}
            >
              ➕ 新建课程
            </button>
          </div>
          <div className="space-y-4">
            {courses.map(course => (
              <motion.div
                key={course.id}
                className={`bg-surface rounded-2xl p-4 shadow ${
                  editingCourse?.id === course.id ? 'ring-4 ring-primary' : ''
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{course.emoji}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text">{course.title}</h3>
                    <p className="text-text-light text-sm">
                      📅 {course.date}
                      {course.sheet?.imageUrl && ' • ✅ 有谱子'}
                    </p>
                  </div>
                  <button
                    className="px-3 py-1 bg-secondary text-white rounded-lg text-sm"
                    onClick={() => startEditCourse(course)}
                  >
                    编辑
                  </button>
                  <button
                    className="px-3 py-1 bg-error/20 text-error rounded-lg text-sm"
                    onClick={() => deleteCourse(course.id)}
                  >
                    删除
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 编辑/新建课程表单 */}
        {showForm && (
          <section className="bg-surface rounded-2xl p-6 shadow-lg">
            <h2 className="font-heading text-lg text-text mb-4">
              {editingCourse ? '✏️ 编辑课程' : '➕ 新建课程'}
            </h2>

            {/* 课程名称 */}
            <div className="mb-4">
              <label className="block text-text font-semibold mb-2">课程名称</label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="例如：认识吉他"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* 上课日期 */}
            <div className="mb-4">
              <label className="block text-text font-semibold mb-2">上课日期</label>
              <input
                type="date"
                value={courseDate}
                onChange={(e) => setCourseDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* 课程图标 */}
            <div className="mb-4">
              <label className="block text-text font-semibold mb-2">图标</label>
              <div className="flex gap-3">
                {['🌟', '🎸', '🎵', '🎶', '🎤', '🎹', '🪗', '🎼'].map(emoji => (
                  <button
                    key={emoji}
                    className={`w-12 h-12 text-2xl rounded-xl ${
                      courseEmoji === emoji ? 'bg-primary ring-2 ring-primary' : 'bg-surface2'
                    }`}
                    onClick={() => setCourseEmoji(emoji)}
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
                sheet={courseSheet}
                editable={true}
                onSheetChange={(sheet) => setCourseSheet(sheet)}
              />
            </div>

            <div className="flex gap-3">
              <button
                className="flex-1 py-3 bg-primary text-white rounded-xl font-bold"
                onClick={saveCourse}
              >
                保存课程
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
