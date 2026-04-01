import { useNavigate } from 'react-router-dom'
import { courses } from '../data/courses'
import { useProgressStore } from '../stores/progressStore'
import { useMissionStore } from '../stores/missionStore'
import { MissionList } from '../components/MissionList'
import type { Mission } from '../stores/missionStore'

export default function Home() {
  const navigate = useNavigate()
  const totalStars = useProgressStore((s) => s.totalStars)
  const { initializeMissions, startMission } = useMissionStore()

  // Initialize missions from courses on first load
  const missions = useMissionStore((s) => s.missions)
  if (missions.length === 0) {
    initializeMissions(courses.map(c => ({
      id: c.id,
      lessons: c.lessons.map(l => ({ id: l.id, title: l.title })),
    })))
  }

  const handleSelectMission = (mission: Mission) => {
    startMission(mission.id)
    navigate(`/lesson/${mission.lessonId}`)
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 顶部导航 */}
      <header className="bg-surface shadow-sm sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🎸</span>
            <h1 className="font-heading text-2xl text-primary">Guitar乐园</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-surface2 px-3 py-1 rounded-full">
              <span className="text-xl">⭐</span>
              <span className="font-bold text-text">{totalStars}</span>
            </div>
            <button 
              className="w-10 h-10 rounded-full bg-surface2 flex items-center justify-center"
              onClick={() => navigate('/rewards')}
            >
              🏆
            </button>
            <button 
              className="w-10 h-10 rounded-full bg-surface2 flex items-center justify-center text-xl"
              onClick={() => navigate('/admin')}
            >
              ⚙️
            </button>
          </div>
        </div>
      </header>

      {/* 主内容 - 任务系统 */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <MissionList onSelectMission={handleSelectMission} />
      </main>
    </div>
  )
}
