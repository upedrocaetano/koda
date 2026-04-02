'use client'

import { MatrixButton } from '@/components/ui'

interface EditorToolbarProps {
  onRun: () => void
  onReset: () => void
  onCopy: () => void
  onFullscreen: () => void
  isRunning: boolean
  isFullscreen: boolean
}

export function EditorToolbar({
  onRun,
  onReset,
  onCopy,
  onFullscreen,
  isRunning,
  isFullscreen,
}: EditorToolbarProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-matrix-green-dim/20 bg-matrix-surface">
      <MatrixButton
        variant="primary"
        size="sm"
        onClick={onRun}
        loading={isRunning}
      >
        ▶ Executar
      </MatrixButton>

      <MatrixButton variant="ghost" size="sm" onClick={onReset}>
        ↻ Resetar
      </MatrixButton>

      <MatrixButton variant="ghost" size="sm" onClick={onCopy}>
        📋 Copiar
      </MatrixButton>

      <div className="flex-1" />

      <MatrixButton variant="ghost" size="sm" onClick={onFullscreen}>
        {isFullscreen ? '⊡ Sair' : '⊞ Tela Cheia'}
      </MatrixButton>
    </div>
  )
}
