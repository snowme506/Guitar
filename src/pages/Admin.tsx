import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { courses as initialCourses } from '../data/courses'
import type { Course } from '../data/types'

export default function Admin() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState(initialCourses)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)

  // 课程表单状态
  const [courseName, setCourseName] = useState('')
  const [courseEmoji, setCourseEmoji] = useState('🌟')
  const [lessonName, setLessonName] = useState('')
  const [classTime, setClassTime] = useState('')

  const startNewCourse = () => {
    setEditingCourse(null)
    setCourseName('')
    setCourseEmoji('🌟')
    setLessonName('')
    setClassTime('')
  }

  const startEditCourse = (course: Course) => {
    setEditingCourse(course)
    setCourseName(course.title)
    setCourseEmoji(course.emoji)
    setLessonName('')
    setClassTime('')
  }

  const saveCourse = () => {
    if (!courseName.trim()) {
      alert('请输入课程名称')
      return
    }

    if (editingCourse) {
      setCourses(prev => prev.map(c => 
        c.id === editingCourse.id 
          ? { ...c, title: courseName, emoji: courseEmoji }
          : c
      ))
      alert('课程已更新')
    } else {
      const newCourse: Course = {
        id: `course-${Date.now()}`,
        title: courseName,
        emoji: courseEmoji,
        coverColor: '#FFB347',
        lessons: [],
      }
      setCourses(prev => [...prev, newCourse])
      alert('课程已添加')
    }
    startNewCourse()
  }

  const addLesson = () => {
    if (!editingCourse) {
      alert('请先选择或创建课程')
      return
    }
    if (!lessonName.trim()) {
      alert('请输入课时名称')
      return
    }

    const newLesson = {
      id: `lesson-${Date.now()}`,
      title: lessonName,
      duration: classTime || '待定',
      starsToUnlock: 0,
      content: {},
    }

    setCourses(prev => prev.map(c => 
      c.id === editingCourse.id 
        ? { ...c, lessons: [...c.lessons, newLesson] }
        : c
    ))
    setLessonName('')
    setClassTime('')
    alert('课时已添加')
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
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{course.emoji}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text">{course.title}</h3>
                    <p className="text-text-light text-sm">
                      {course.lessons.length} 课时
                    </p>
                  </div>
                  <button
                    className="px-4 py-2 bg-secondary text-white rounded-xl text-sm"
                    onClick={() => startEditCourse(course)}
                  >
                    编辑
                  </button>
                </div>

                {/* 课时列表 */}
                {editingCourse?.id === course.id && course.lessons.length > 0 && (
                  <div className="mt-3 pl-4 border-l-2 border-primary/30">
                    <p className="text-sm text-text-light mb-2">课时：</p>
                    <div className="space-y-2">
                      {course.lessons.map((lesson, idx) => (
                        <div key={lesson.id} className="flex items-center gap-2 text-sm">
                          <span className="text-text-light">{idx + 1}.</span>
                          <span className="text-text">{lesson.title}</span>
                          {lesson.duration && (
                            <span className="text-primary text-xs">⏰ {lesson.duration}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* 编辑/新建课程 */}
        {(editingCourse !== null || courseName !== '') && (
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
                placeholder="例如：入门课程"
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

            <button
              className="w-full py-3 bg-primary text-white rounded-xl font-bold mb-6"
              onClick={saveCourse}
            >
              保存课程
            </button>

            {/* 添加课时 */}
            {editingCourse && (
              <div className="border-t pt-6">
                <h3 className="font-semibold text-text mb-4">➕ 添加课时</h3>

                <div className="mb-4">
                  <label className="block text-text font-semibold mb-2">课时名称</label>
                  <input
                    type="text"
                    value={lessonName}
                    onChange={(e) => setLessonName(e.target.value)}
                    placeholder="例如：认识吉他"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-text font-semibold mb-2">上课时间</label>
                  <input
                    type="text"
                    value={classTime}
                    onChange={(e) => setClassTime(e.target.value)}
                    placeholder="例如：周一 10:00"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <button
                  className="w-full py-3 bg-accent text-white rounded-xl font-bold"
                  onClick={addLesson}
                >
                  添加课时
                </button>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}
