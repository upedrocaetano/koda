import { cn } from '@/lib/utils'
import { MatrixCard } from '@/components/ui'

interface StreakDisplayProps {
  currentStreak: number
  maxStreak: number
}

export function StreakDisplay({ currentStreak, maxStreak }: StreakDisplayProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-matrix-green-dim/20 bg-matrix-card p-4">
      <div
        className={cn('text-4xl', currentStreak > 0 ? 'animate-pulse' : 'opacity-30')}
      >
        🔥
      </div>
      <div className="flex-1">
        <p className="text-3xl font-display font-bold text-matrix-green">
          {currentStreak}
        </p>
        <p className="text-sm text-matrix-green-dim">
          {currentStreak === 0
            ? 'Faça sua primeira sessão hoje!'
            : currentStreak === 1
              ? 'dia consecutivo'
              : 'dias consecutivos'}
        </p>
      </div>
      <div className="text-right">
        <p className="text-xs text-matrix-green-dim/60">Recorde</p>
        <p className="text-lg font-display font-bold text-matrix-gold">
          {maxStreak}
        </p>
      </div>
    </div>
  )
}

interface StatsCardsProps {
  totalXP: number
  conceptsMastered: number
  hoursStudied: number
  modulesComplete: number
}

export function StatsCards({ totalXP, conceptsMastered, hoursStudied, modulesComplete }: StatsCardsProps) {
  const stats = [
    { icon: '⚡', value: totalXP.toLocaleString('pt-BR'), label: 'Total de XP' },
    { icon: '🧠', value: conceptsMastered, label: 'Conceitos dominados' },
    { icon: '⏱️', value: `${hoursStudied}h`, label: 'Horas de estudo' },
    { icon: '📦', value: modulesComplete, label: 'Módulos completos' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <MatrixCard key={stat.label}>
          <div className="text-center">
            <span className="text-2xl" role="img" aria-hidden="true">
              {stat.icon}
            </span>
            <p
              className="text-xl font-display font-bold text-matrix-green mt-1"
              style={{ textShadow: '0 0 6px #00FF41' }}
            >
              {stat.value}
            </p>
            <p className="text-xs text-matrix-green-dim mt-0.5">{stat.label}</p>
          </div>
        </MatrixCard>
      ))}
    </div>
  )
}
