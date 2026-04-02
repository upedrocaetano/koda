'use client'

import { useEffect } from 'react'
import { useChatStore } from '@/stores/chat-store'
import { useAuth } from '@/hooks/use-auth'
import { ChatMessages } from '@/components/chat/chat-messages'
import { ChatInput } from '@/components/chat/chat-input'
import { LessonHeader } from '@/components/chat/lesson-header'

export default function ChatPage() {
  const { user, isLoading: authLoading } = useAuth()
  const {
    messages, isLoading, hasMore, currentState, lessonContext, lastXPEarned,
    sendMessage, loadHistory, loadMore, clearXPNotification,
  } = useChatStore()

  useEffect(() => {
    if (user?.id && messages.length === 0) {
      loadHistory(user.id)
    }
  }, [user?.id, messages.length, loadHistory])

  if (authLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-matrix-green-dim text-sm animate-pulse">
          Conectando ao Koda...
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="border-b border-matrix-green-dim/20 bg-matrix-surface px-4 py-3 flex items-center gap-3">
        <div
          className="font-display text-sm font-bold text-matrix-green"
          style={{ textShadow: '0 0 6px #00FF41' }}
        >
          Koda
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className={`h-2 w-2 rounded-full ${isLoading ? 'bg-matrix-gold animate-pulse' : 'bg-matrix-green'}`}
          />
          <span className="text-xs text-matrix-green-dim">
            {isLoading ? 'pensando...' : 'online'}
          </span>
        </div>
      </div>

      {/* Lesson Header */}
      {lessonContext && (
        <LessonHeader
          moduleName={lessonContext.module_name}
          conceptName={lessonContext.concept_name}
          state={currentState}
        />
      )}

      {/* Messages */}
      <ChatMessages
        messages={messages}
        isLoading={isLoading}
        hasMore={hasMore}
        lastXPEarned={lastXPEarned}
        onLoadMore={() => user?.id && loadMore(user.id)}
        onSendGateResponse={(msg) => user?.id && sendMessage(msg, user.id)}
        onClearXP={clearXPNotification}
      />

      {/* Input */}
      <ChatInput
        onSend={(msg) => user?.id && sendMessage(msg, user.id)}
        disabled={isLoading}
      />
    </>
  )
}
