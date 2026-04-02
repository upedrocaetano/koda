'use client'

import { useEffect, useState } from 'react'

interface XPNotificationProps {
  xpEarned: number
  onDone?: () => void
}

export function XPNotification({ xpEarned, onDone }: XPNotificationProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (xpEarned <= 0) return

    const timer = setTimeout(() => {
      setVisible(false)
      onDone?.()
    }, 2500)

    return () => clearTimeout(timer)
  }, [xpEarned, onDone])

  if (xpEarned <= 0 || !visible) return null

  return (
    <div className="flex justify-center my-2 pointer-events-none">
      <div
        className="animate-bounce px-4 py-2 rounded-full bg-matrix-gold/10 border border-matrix-gold/30"
        style={{
          animation: 'floatUp 2.5s ease-out forwards',
        }}
      >
        <span
          className="font-display text-lg font-bold text-matrix-gold"
          style={{ textShadow: '0 0 10px rgba(255,215,0,0.6)' }}
        >
          +{xpEarned} XP
        </span>
      </div>
    </div>
  )
}
