'use client'

import { OptionCard } from './option-card'

const GOALS = [
  { value: 'zero_to_dev', icon: '🚀', label: 'Aprender do zero', description: 'Nunca programei, quero começar' },
  { value: 'career_change', icon: '💼', label: 'Mudar de carreira', description: 'Quero migrar para tecnologia' },
  { value: 'create_saas', icon: '💻', label: 'Criar meu SaaS', description: 'Tenho uma ideia e quero construir' },
] as const

interface StepGoalProps {
  goal: string
  onGoalChange: (goal: string) => void
}

export function StepGoal({ goal, onGoalChange }: StepGoalProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2
          className="font-display text-xl text-matrix-green"
          style={{ textShadow: '0 0 8px #00FF41' }}
        >
          Qual seu objetivo?
        </h2>
        <p className="text-sm text-matrix-green-dim">
          Isso nos ajuda a personalizar sua jornada
        </p>
      </div>

      <div className="space-y-3">
        {GOALS.map((g) => (
          <OptionCard
            key={g.value}
            icon={g.icon}
            label={g.label}
            description={g.description}
            selected={goal === g.value}
            onClick={() => onGoalChange(g.value)}
          />
        ))}
      </div>
    </div>
  )
}
