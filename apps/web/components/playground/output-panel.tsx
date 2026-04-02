'use client'

import { useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

export interface LogEntry {
  type: 'log' | 'warn' | 'error'
  message: string
  timestamp: number
  line?: number | null
}

interface OutputPanelProps {
  logs: LogEntry[]
  onClear: () => void
}

const TYPE_STYLES = {
  log: 'text-matrix-green',
  warn: 'text-matrix-gold',
  error: 'text-matrix-accent',
} as const

export function OutputPanel({ logs, onClear }: OutputPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [logs.length])

  return (
    <div className="flex flex-col h-full border-l border-matrix-green-dim/20 bg-matrix-bg">
      <div className="flex items-center justify-between px-3 py-2 border-b border-matrix-green-dim/20 bg-matrix-surface">
        <span className="text-xs text-matrix-green-dim font-medium">Output</span>
        <button
          onClick={onClear}
          className="text-xs text-matrix-green-dim hover:text-matrix-green transition-colors"
        >
          Limpar
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-1 font-code text-xs">
        {logs.length === 0 && (
          <p className="text-matrix-green-dim/40 italic">
            Clique em &quot;Executar&quot; para ver o output aqui.
          </p>
        )}
        {logs.map((log, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-matrix-green-dim/30 shrink-0">
              {new Date(log.timestamp).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
            <span className={cn('whitespace-pre-wrap break-all', TYPE_STYLES[log.type])}>
              {log.line != null && <span className="text-matrix-muted">[L{log.line}] </span>}
              {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
