'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { MatrixCard, MatrixButton } from '@/components/ui'
import { PersonalInfo } from '@/components/profile/personal-info'
import { LevelTimeline } from '@/components/profile/level-timeline'
import { SettingsPanel } from '@/components/profile/settings-panel'

interface ProfileClientProps {
  userId: string
  name: string | null
  email: string | null
  goal: string | null
  level: string
  createdAt: string
  levelEvents: Array<{ created_at: string; new_level: number; xp_at_time: number }>
  stats: {
    totalSessions: number
    hoursStudied: number
    conceptsMastered: number
    bestStreak: number
  }
}

export function ProfileClient({
  userId,
  name,
  email,
  goal,
  level,
  createdAt,
  levelEvents,
  stats,
}: ProfileClientProps) {
  const { signOut } = useAuth()
  const [showLogout, setShowLogout] = useState(false)

  return (
    <div className="p-6 md:p-8 max-w-[640px] mx-auto space-y-6">
      {/* Personal Info */}
      <MatrixCard
        header={
          <span className="text-sm font-medium text-matrix-green">
            Informações Pessoais
          </span>
        }
      >
        <PersonalInfo
          userId={userId}
          name={name}
          email={email}
          goal={goal}
          level={level}
          createdAt={createdAt}
        />
      </MatrixCard>

      {/* Stats */}
      <MatrixCard
        header={
          <span className="text-sm font-medium text-matrix-green">
            Estatísticas
          </span>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Total de sessões', value: stats.totalSessions },
            { label: 'Horas de estudo', value: `${stats.hoursStudied}h` },
            { label: 'Conceitos dominados', value: stats.conceptsMastered },
            { label: 'Melhor streak', value: `${stats.bestStreak} dias` },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-lg font-display font-bold text-matrix-green">
                {s.value}
              </p>
              <p className="text-xs text-matrix-green-dim">{s.label}</p>
            </div>
          ))}
        </div>
      </MatrixCard>

      {/* Level Timeline */}
      <MatrixCard
        header={
          <span className="text-sm font-medium text-matrix-green">
            Histórico de Nível
          </span>
        }
      >
        <LevelTimeline events={levelEvents} />
      </MatrixCard>

      {/* Settings */}
      <MatrixCard
        header={
          <span className="text-sm font-medium text-matrix-green">
            Configurações
          </span>
        }
      >
        <SettingsPanel />
      </MatrixCard>

      {/* Logout */}
      <div className="pt-4">
        {showLogout ? (
          <MatrixCard>
            <p className="text-sm text-matrix-green-dim mb-3">
              Tem certeza que quer sair?
            </p>
            <div className="flex gap-3">
              <MatrixButton variant="danger" size="sm" onClick={signOut}>
                Sim, sair
              </MatrixButton>
              <MatrixButton variant="ghost" size="sm" onClick={() => setShowLogout(false)}>
                Cancelar
              </MatrixButton>
            </div>
          </MatrixCard>
        ) : (
          <MatrixButton
            variant="danger"
            size="md"
            onClick={() => setShowLogout(true)}
            className="w-full"
          >
            Sair da conta
          </MatrixButton>
        )}
      </div>
    </div>
  )
}
