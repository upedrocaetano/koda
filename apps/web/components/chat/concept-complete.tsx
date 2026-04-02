'use client'

import { MatrixButton } from '@/components/ui'

interface ConceptCompleteProps {
  conceptName: string
  xpEarned: number
  nextConceptName?: string | null
  onNextConcept?: () => void
  onGoToHub?: () => void
}

export function ConceptComplete({
  conceptName,
  xpEarned,
  nextConceptName,
  onNextConcept,
  onGoToHub,
}: ConceptCompleteProps) {
  return (
    <div className="rounded-lg border-2 border-matrix-green bg-matrix-card p-5 my-3 text-center"
      style={{ boxShadow: '0 0 20px rgba(0,255,65,0.2)' }}
    >
      <div className="text-3xl mb-2">🎉</div>
      <h3
        className="font-display text-lg font-bold text-matrix-green mb-1"
        style={{ textShadow: '0 0 10px #00FF41' }}
      >
        Conceito Concluído!
      </h3>
      <p className="text-sm text-matrix-green-dim mb-3">
        Você dominou <strong className="text-matrix-green">{conceptName}</strong>
      </p>

      <div className="flex justify-center gap-4 mb-4">
        <div className="text-center">
          <p
            className="font-display text-xl font-bold text-matrix-gold"
            style={{ textShadow: '0 0 8px rgba(255,215,0,0.5)' }}
          >
            +{xpEarned}
          </p>
          <p className="text-xs text-matrix-muted">XP ganho</p>
        </div>
      </div>

      <div className="flex justify-center gap-2">
        {nextConceptName && onNextConcept && (
          <MatrixButton variant="primary" size="sm" onClick={onNextConcept}>
            Próximo: {nextConceptName}
          </MatrixButton>
        )}
        {onGoToHub && (
          <MatrixButton variant="ghost" size="sm" onClick={onGoToHub}>
            Voltar ao Hub
          </MatrixButton>
        )}
      </div>
    </div>
  )
}
