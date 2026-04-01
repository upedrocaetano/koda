'use client'

import { useRef, useState, useCallback } from 'react'
import { MatrixButton } from '@/components/ui'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const resize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [])

  function handleSubmit() {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="border-t border-matrix-green-dim/20 bg-matrix-bg p-3">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            resize()
          }}
          onKeyDown={handleKeyDown}
          placeholder="Enviar mensagem para o Koda..."
          aria-label="Enviar mensagem para o Koda"
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-md border border-matrix-green-dim/30 bg-matrix-input px-3 py-2 text-sm text-matrix-green placeholder:text-matrix-green-dim/40 focus:outline-none focus:ring-1 focus:ring-matrix-green disabled:opacity-50"
        />
        <MatrixButton
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          aria-label="Enviar"
        >
          ↑
        </MatrixButton>
      </div>
    </div>
  )
}
