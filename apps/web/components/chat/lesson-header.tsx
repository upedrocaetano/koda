'use client'

interface LessonHeaderProps {
  moduleName: string
  conceptName: string
  state: string
}

export function LessonHeader({ moduleName, conceptName, state }: LessonHeaderProps) {
  const stateLabel = getStateLabel(state)

  return (
    <div className="border-b border-matrix-gold/20 bg-matrix-card/50 px-4 py-2 flex items-center gap-2 text-xs">
      <span className="text-matrix-gold">📚</span>
      <span className="text-matrix-green-dim">
        {moduleName}
      </span>
      <span className="text-matrix-muted">&gt;</span>
      <span className="text-matrix-green font-medium">
        {conceptName}
      </span>
      {stateLabel && (
        <>
          <span className="text-matrix-muted">&gt;</span>
          <span className={`font-display ${
            state.startsWith('GATE') ? 'text-matrix-gold' : 'text-matrix-green-dim'
          }`}>
            {stateLabel}
          </span>
        </>
      )}
    </div>
  )
}

function getStateLabel(state: string): string | null {
  switch (state) {
    case 'LESSON': return 'Explicação'
    case 'GATE_1': return 'Portão 1'
    case 'GATE_2': return 'Portão 2'
    default: return null
  }
}
