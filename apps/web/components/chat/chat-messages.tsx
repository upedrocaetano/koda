'use client'

import { useEffect, useRef } from 'react'
import { ChatMessage } from './chat-message'
import { XPNotification } from './xp-notification'
import { MatrixButton } from '@/components/ui'
import type { ChatMessage as ChatMessageType } from '@/stores/chat-store'

interface ChatMessagesProps {
  messages: ChatMessageType[]
  isLoading: boolean
  hasMore: boolean
  lastXPEarned: number
  onLoadMore: () => void
  onSendGateResponse: (response: string) => void
  onClearXP: () => void
}

export function ChatMessages({
  messages,
  isLoading,
  hasMore,
  lastXPEarned,
  onLoadMore,
  onSendGateResponse,
  onClearXP,
}: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const prevLengthRef = useRef(0)

  useEffect(() => {
    // Auto-scroll when new messages arrive
    if (messages.length > prevLengthRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    prevLengthRef.current = messages.length
  }, [messages.length])

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {hasMore && (
        <div className="text-center">
          <MatrixButton variant="ghost" size="sm" onClick={onLoadMore}>
            Carregar mais
          </MatrixButton>
        </div>
      )}

      {messages.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <p
            className="font-display text-lg text-matrix-green mb-2"
            style={{ textShadow: '0 0 8px #00FF41' }}
          >
            Koda
          </p>
          <p className="text-matrix-green-dim text-sm">
            Olá! Sou o Koda, seu professor de programação.
            <br />
            Como posso te ajudar hoje?
          </p>
        </div>
      )}

      {messages.map((msg) => (
        <ChatMessage
          key={msg.id}
          message={msg}
          onSendGateResponse={onSendGateResponse}
          isLoading={isLoading}
        />
      ))}

      {lastXPEarned > 0 && (
        <XPNotification xpEarned={lastXPEarned} onDone={onClearXP} />
      )}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-matrix-card border border-matrix-green-dim/10 rounded-lg px-4 py-3">
            <div className="flex items-center gap-1 text-matrix-green-dim text-sm">
              <span>Koda está pensando</span>
              <span className="animate-pulse">.</span>
              <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>
                .
              </span>
              <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>
                .
              </span>
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
