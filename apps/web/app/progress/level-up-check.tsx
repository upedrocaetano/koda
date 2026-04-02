'use client'

import { useEffect, useState } from 'react'
import { LevelUpOverlay } from '@/components/progress/level-up-overlay'

interface LevelUpCheckProps {
  level: number
  title: string
}

export function LevelUpCheck({ level, title }: LevelUpCheckProps) {
  const [showLevelUp, setShowLevelUp] = useState(false)

  useEffect(() => {
    const lastSeen = parseInt(localStorage.getItem('koda_lastSeenLevel') ?? '0', 10)
    if (level > lastSeen && lastSeen > 0) {
      setShowLevelUp(true)
    }
    localStorage.setItem('koda_lastSeenLevel', String(level))
  }, [level])

  if (!showLevelUp) return null

  return (
    <LevelUpOverlay
      level={level}
      title={title}
      onDone={() => setShowLevelUp(false)}
    />
  )
}
