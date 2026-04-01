import { cn } from '@/lib/utils'
import type { ChatMessage as ChatMessageType } from '@/stores/chat-store'

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-lg px-4 py-3 text-sm',
          isUser
            ? 'bg-matrix-input text-matrix-white'
            : 'bg-matrix-card text-matrix-green-dim border border-matrix-green-dim/10',
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="whitespace-pre-wrap prose-invert">
            {message.content.split('```').map((block, i) => {
              if (i % 2 === 1) {
                // Code block
                const lines = block.split('\n')
                const lang = lines[0]?.trim()
                const code = lines.slice(lang ? 1 : 0).join('\n')
                return (
                  <div
                    key={i}
                    className="my-2 rounded bg-matrix-bg border border-matrix-green-dim/20 overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-3 py-1 bg-matrix-surface text-xs text-matrix-muted">
                      <span>{lang || 'code'}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(code)}
                        className="text-matrix-green-dim hover:text-matrix-green transition-colors"
                        aria-label="Copiar código"
                      >
                        Copiar
                      </button>
                    </div>
                    <pre className="p-3 overflow-x-auto text-xs font-code text-matrix-green">
                      <code>{code}</code>
                    </pre>
                  </div>
                )
              }
              // Regular text — simple bold/italic handling
              return (
                <span key={i}>
                  {block.split('**').map((part, j) =>
                    j % 2 === 1 ? (
                      <strong key={j} className="text-matrix-green">
                        {part}
                      </strong>
                    ) : (
                      part
                    ),
                  )}
                </span>
              )
            })}
          </div>
        )}
        <p className="text-[10px] text-matrix-muted/50 mt-1">
          {new Date(message.createdAt).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  )
}
