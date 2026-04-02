'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { MatrixInput } from '@/components/ui'

interface StepWelcomeProps {
  name: string
  onNameChange: (name: string) => void
}

const FULL_TEXT = 'Bem-vindo ao Koda'

export function StepWelcome({ name, onNameChange }: StepWelcomeProps) {
  const [displayText, setDisplayText] = useState('')
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    let index = 0
    const interval = setInterval(() => {
      index++
      setDisplayText(FULL_TEXT.slice(0, index))
      if (index >= FULL_TEXT.length) {
        clearInterval(interval)
        setTimeout(() => setShowContent(true), 300)
      }
    }, 60)
    return () => clearInterval(interval)
  }, [])

  const error = name.length > 0 && name.length < 2 ? 'Mínimo 2 caracteres' : undefined

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1
          className="font-display text-2xl text-matrix-green min-h-[2rem]"
          style={{ textShadow: '0 0 10px #00FF41' }}
        >
          {displayText}
          <span className="animate-pulse">_</span>
        </h1>
        <p
          className={cn(
            'text-sm text-matrix-green-dim transition-opacity duration-500',
            showContent ? 'opacity-100' : 'opacity-0',
          )}
        >
          Seu professor de programação com IA
        </p>
      </div>

      <div
        className={cn(
          'transition-all duration-500',
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        )}
      >
        <MatrixInput
          label="Como posso te chamar?"
          placeholder="Seu nome"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          error={error}
          autoFocus
        />
      </div>
    </div>
  )
}
