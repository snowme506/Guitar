import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Lesson from './pages/Lesson'
import Rewards from './pages/Rewards'
import Admin from './pages/Admin'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lesson/:lessonId" element={<Lesson />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
