interface LevelEvent {
  created_at: string
  new_level: number
  xp_at_time: number
}

interface LevelTimelineProps {
  events: LevelEvent[]
}

const LEVEL_TITLES: Record<number, string> = {
  1: 'Curioso',
  2: 'Aprendiz',
  3: 'Praticante',
  4: 'Codador',
  5: 'Developer',
  6: 'Fullstack',
  7: 'Arquiteto',
  8: 'Mestre Koda',
}

export function LevelTimeline({ events }: LevelTimelineProps) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-matrix-green-dim/40 italic">
        Nenhum level-up registrado ainda. Continue estudando!
      </p>
    )
  }

  return (
    <ol role="list" className="space-y-4">
      {events.map((event, i) => (
        <li key={i} className="flex gap-4">
          {/* Dot + line */}
          <div className="flex flex-col items-center">
            <div
              className="h-3 w-3 rounded-full bg-matrix-green shadow-[0_0_6px_rgba(0,255,65,0.4)]"
            />
            {i < events.length - 1 && (
              <div className="w-0.5 flex-1 bg-matrix-green-dim/20 mt-1" />
            )}
          </div>

          {/* Content */}
          <div className="pb-4">
            <p className="text-sm text-matrix-green font-medium">
              Nível {event.new_level} — {LEVEL_TITLES[event.new_level] || `Nível ${event.new_level}`}
            </p>
            <p className="text-xs text-matrix-green-dim/60">
              {new Date(event.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
              {' · '}
              {event.xp_at_time} XP
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}
