import { cn } from '@/lib/utils'

interface Achievement {
  id: string
  name: string
  icon: string
  description: string
  unlocked: boolean
}

interface AchievementGridProps {
  achievements: Achievement[]
}

export const BADGE_DEFINITIONS: Omit<Achievement, 'unlocked'>[] = [
  { id: 'first_login', name: 'Primeiro Login', icon: '🚀', description: 'Entrou no Koda pela primeira vez' },
  { id: 'first_lesson', name: 'Primeira Aula', icon: '📖', description: 'Completou a primeira aula' },
  { id: 'gate_1_master', name: 'Gate 1 Mestre', icon: '🧠', description: 'Passou 5 portões de compreensão' },
  { id: 'gate_2_master', name: 'Gate 2 Mestre', icon: '💻', description: 'Passou 5 portões de prática' },
  { id: 'streak_7', name: 'Streak 7 dias', icon: '🔥', description: '7 dias consecutivos estudando' },
  { id: 'streak_30', name: 'Streak 30 dias', icon: '⚡', description: '30 dias consecutivos estudando' },
  { id: 'level_3', name: 'Nível 3', icon: '⭐', description: 'Alcançou o nível 3' },
  { id: 'level_5', name: 'Nível 5', icon: '🌟', description: 'Alcançou o nível 5' },
  { id: 'xp_100_day', name: '100 XP em 1 dia', icon: '💎', description: 'Ganhou 100 XP em um único dia' },
  { id: 'perfect_concept', name: 'Conceito Perfeito', icon: '🎯', description: 'Passou um conceito sem errar' },
]

export function AchievementGrid({ achievements }: AchievementGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {achievements.map((badge) => (
        <div
          key={badge.id}
          className={cn(
            'flex flex-col items-center gap-2 rounded-lg border p-4 transition-all',
            badge.unlocked
              ? 'border-matrix-green/30 bg-matrix-green/5 shadow-[0_0_12px_rgba(0,255,65,0.1)]'
              : 'border-matrix-green-dim/10 bg-matrix-card opacity-30',
          )}
        >
          <div className="relative">
            <span className="text-3xl" role="img" aria-label={badge.name}>
              {badge.icon}
            </span>
            {!badge.unlocked && (
              <span className="absolute -bottom-1 -right-1 text-xs">🔒</span>
            )}
          </div>
          <p
            className={cn(
              'text-xs text-center font-medium',
              badge.unlocked ? 'text-matrix-green' : 'text-matrix-green-dim/40',
            )}
          >
            {badge.name}
          </p>
        </div>
      ))}
    </div>
  )
}
