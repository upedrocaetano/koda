'use client'

import { useEffect, useState } from 'react'

interface LevelUpOverlayProps {
  level: number
  title: string
  onDone: () => void
}

export function LevelUpOverlay({ level, title, onDone }: LevelUpOverlayProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onDone()
    }, 3000)
    return () => clearTimeout(timer)
  }, [onDone])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-matrix-bg/90 backdrop-blur-sm"
      onClick={() => {
        setVisible(false)
        onDone()
      }}
      role="dialog"
      aria-label="Level up"
    >
      {/* Particle effect via CSS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-matrix-green"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `particle ${1.5 + Math.random() * 1.5}s ease-out ${Math.random() * 0.5}s forwards`,
              opacity: 0,
            }}
          />
        ))}
      </div>

      <div className="text-center space-y-4 animate-[scaleIn_0.5s_ease-out]">
        <p className="text-matrix-gold text-sm font-medium uppercase tracking-widest">
          Level Up!
        </p>
        <div
          className="text-8xl font-display font-bold text-matrix-green"
          style={{ textShadow: '0 0 30px #00FF41, 0 0 60px #00FF41' }}
        >
          {level}
        </div>
        <p
          className="text-xl font-display text-matrix-green-dim"
          style={{ textShadow: '0 0 8px #00CC33' }}
        >
          {title}
        </p>
      </div>
    </div>
  )
}
