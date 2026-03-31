import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ConfettiProps {
  isActive: boolean
  duration?: number
}

const colors = ['#FFB347', '#87CEEB', '#98D8AA', '#FF6B9D', '#FFD700', '#B39DDB']

interface Particle {
  id: number
  x: number
  color: string
  size: number
  delay: number
}

export default function Confetti({ isActive, duration = 3000 }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (isActive) {
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 12 + 6,
        delay: Math.random() * 0.5,
      }))
      setParticles(newParticles)

      const timer = setTimeout(() => setParticles([]), duration)
      return () => clearTimeout(timer)
    }
  }, [isActive, duration])

  return (
    <AnimatePresence>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: '-20px',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          initial={{ y: -20, x: 0, opacity: 1, rotate: 0 }}
          animate={{
            y: typeof window !== 'undefined' ? window.innerHeight + 20 : 800,
            x: Math.random() * 200 - 100,
            opacity: [1, 1, 0],
            rotate: Math.random() * 720,
          }}
          transition={{
            duration: 3,
            delay: p.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </AnimatePresence>
  )
}
