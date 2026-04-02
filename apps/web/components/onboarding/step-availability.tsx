'use client'

import { OptionCard } from './option-card'

const AVAILABILITIES = [
  { value: '10', icon: '⏱️', label: '5–10 min por dia', description: 'Sessões rápidas e focadas' },
  { value: '20', icon: '📅', label: '15–30 min por dia', description: 'Ritmo equilibrado' },
  { value: '45', icon: '🔥', label: '30+ min por dia', description: 'Aprendizado intensivo' },
] as const

interface StepAvailabilityProps {
  availability: string
  onAvailabilityChange: (availability: string) => void
}

export function StepAvailability({ availability, onAvailabilityChange }: StepAvailabilityProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2
          className="font-display text-xl text-matrix-green"
          style={{ textShadow: '0 0 8px #00FF41' }}
        >
          Quanto tempo por dia?
        </h2>
        <p className="text-sm text-matrix-green-dim">
          Adaptamos o ritmo ao seu tempo disponível
        </p>
      </div>

      <div className="space-y-3">
        {AVAILABILITIES.map((a) => (
          <OptionCard
            key={a.value}
            icon={a.icon}
            label={a.label}
            description={a.description}
            selected={availability === a.value}
            onClick={() => onAvailabilityChange(a.value)}
          />
        ))}
      </div>
    </div>
  )
}
