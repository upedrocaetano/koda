'use client'

import { useState, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { MatrixButton } from '@/components/ui'

interface GateCardProps {
  gateNumber: 1 | 2
  conceptName: string
  exercise?: string
  onSubmit: (response: string) => void
  disabled?: boolean
  attempts?: number
  maxAttempts?: number
  result?: {
    passed: boolean
    xpEarned: number
    passedWithHelp: boolean
  } | null
}

export function GateCard({
  gateNumber,
  conceptName,
  exercise,
  onSubmit,
  disabled = false,
  attempts = 0,
  maxAttempts = 3,
  result,
}: GateCardProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isGate1 = gateNumber === 1
  const title = isGate1 ? 'Portão da Compreensão' : 'Portão da Prática'
  const description = isGate1
    ? `Me explica com suas palavras o que é **${conceptName}**?`
    : exercise || `Escreva o código para o exercício de **${conceptName}**`

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSubmit(trimmed)
    setValue('')
  }, [value, disabled, onSubmit])

  // Determinar estado visual do card
  const borderClass = result
    ? result.passed
      ? 'border-matrix-green shadow-[0_0_15px_rgba(0,255,65,0.3)]'
      : 'border-matrix-accent/60'
    : 'border-matrix-gold/60'

  return (
    <div
      className={cn(
        'rounded-lg border-2 bg-matrix-card p-4 my-2 transition-all duration-300',
        borderClass,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-matrix-gold text-lg">
            {isGate1 ? '🧠' : '💻'}
          </span>
          <h3
            className="font-display text-sm font-bold text-matrix-gold"
            style={{ textShadow: '0 0 6px rgba(255,215,0,0.4)' }}
          >
            {title}
          </h3>
        </div>
        {attempts > 0 && !result?.passed && (
          <span className="text-xs text-matrix-muted">
            Tentativa {attempts}/{maxAttempts}
          </span>
        )}
      </div>

      {/* Descrição */}
      <p className="text-sm text-matrix-green-dim mb-3 whitespace-pre-wrap">
        {description.split('**').map((part, i) =>
          i % 2 === 1 ? (
            <strong key={i} className="text-matrix-green">{part}</strong>
          ) : (
            part
          ),
        )}
      </p>

      {/* Resultado (se já avaliado) */}
      {result && (
        <GateResult
          passed={result.passed}
          xpEarned={result.xpEarned}
          passedWithHelp={result.passedWithHelp}
        />
      )}

      {/* Input area (se ainda não passou) */}
      {!result?.passed && (
        <div className="space-y-2">
          {isGate1 ? (
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Escreva sua explicação aqui..."
              disabled={disabled}
              rows={3}
              className="w-full resize-none rounded-md border border-matrix-green-dim/30 bg-matrix-input px-3 py-2 text-sm text-matrix-green placeholder:text-matrix-green-dim/40 focus:outline-none focus:ring-1 focus:ring-matrix-gold disabled:opacity-50"
            />
          ) : (
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="// Escreva seu código aqui..."
              disabled={disabled}
              rows={5}
              className="w-full resize-none rounded-md border border-matrix-green-dim/30 bg-matrix-bg px-3 py-2 text-sm font-code text-matrix-green placeholder:text-matrix-green-dim/40 focus:outline-none focus:ring-1 focus:ring-matrix-gold disabled:opacity-50"
              spellCheck={false}
            />
          )}

          <div className="flex justify-end">
            <MatrixButton
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={disabled || !value.trim()}
            >
              {isGate1 ? 'Enviar Resposta' : 'Executar e Enviar'}
            </MatrixButton>
          </div>
        </div>
      )}
    </div>
  )
}

function GateResult({
  passed,
  xpEarned,
  passedWithHelp,
}: {
  passed: boolean
  xpEarned: number
  passedWithHelp: boolean
}) {
  if (!passed) return null

  return (
    <div className="mt-2 p-3 rounded-md bg-matrix-green/5 border border-matrix-green/20">
      <div className="flex items-center gap-2 mb-1">
        <span
          className="font-display text-sm font-bold text-matrix-green"
          style={{ textShadow: '0 0 10px #00FF41' }}
        >
          PORTÃO APROVADO!
        </span>
        {passedWithHelp && (
          <span className="text-xs text-matrix-muted">(com ajuda)</span>
        )}
      </div>
      {xpEarned > 0 && (
        <p
          className="text-sm font-bold text-matrix-gold animate-pulse"
          style={{ textShadow: '0 0 6px rgba(255,215,0,0.5)' }}
        >
          +{xpEarned} XP
        </p>
      )}
    </div>
  )
}
