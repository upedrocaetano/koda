'use client'

import { OptionCard } from './option-card'

const LEVELS = [
  { value: 'beginner', icon: '🌱', label: 'Nunca programei', description: 'Zero experiência com código' },
  { value: 'basic_html', icon: '📝', label: 'Sei um pouco de HTML', description: 'Já mexi em sites básicos' },
  { value: 'knows_js', icon: '⌨️', label: 'Já sei JavaScript', description: 'Tenho noções de programação' },
] as const

interface StepLevelProps {
  level: string
  onLevelChange: (level: string) => void
}

export function StepLevel({ level, onLevelChange }: StepLevelProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2
          className="font-display text-xl text-matrix-green"
          style={{ textShadow: '0 0 8px #00FF41' }}
        >
          Qual seu nível atual?
        </h2>
        <p className="text-sm text-matrix-green-dim">
          Vamos começar no ponto certo pra você
        </p>
      </div>

      <div className="space-y-3">
        {LEVELS.map((l) => (
          <OptionCard
            key={l.value}
            icon={l.icon}
            label={l.label}
            description={l.description}
            selected={level === l.value}
            onClick={() => onLevelChange(l.value)}
          />
        ))}
      </div>
    </div>
  )
}
