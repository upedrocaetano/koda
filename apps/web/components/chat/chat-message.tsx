import { cn } from '@/lib/utils'
import { GateCard } from './gate-card'
import { ConceptComplete } from './concept-complete'
import type { ChatMessage as ChatMessageType } from '@/stores/chat-store'
import { CURRICULUM, getNextConcept } from '@/lib/lesson/curriculum'

interface ChatMessageProps {
  message: ChatMessageType
  onSendGateResponse?: (response: string) => void
  isLoading?: boolean
}

export function ChatMessage({ message, onSendGateResponse, isLoading }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const decisions = message.decisions
  const state = message.state

  // Verificar se deve renderizar card de conceito concluído
  const isConceptComplete =
    decisions?.gate_passed === true &&
    decisions?.gate_number === 2 &&
    decisions?.concept_id

  // Verificar se deve renderizar GateCard (estado de portão ativo)
  const isGateState = state === 'GATE_1' || state === 'GATE_2'
  const showGateCard = !isUser && isGateState && decisions?.gate_passed === null

  return (
    <div className="space-y-2">
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
              {renderMarkdown(message.content)}
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

      {/* Gate Card — quando o Koda pede para o aluno responder um portão */}
      {showGateCard && onSendGateResponse && (
        <GateCard
          gateNumber={state === 'GATE_1' ? 1 : 2}
          conceptName={decisions?.concept_id ? (CURRICULUM[decisions.concept_id]?.name ?? decisions.concept_id) : ''}
          exercise={decisions?.concept_id ? CURRICULUM[decisions.concept_id]?.exercise : undefined}
          onSubmit={onSendGateResponse}
          disabled={isLoading}
          attempts={decisions?.attempts_used || 0}
          maxAttempts={state === 'GATE_2' ? 3 : 2}
        />
      )}

      {/* Gate Result — quando o portão já foi avaliado */}
      {!isUser && decisions?.gate_passed !== null && decisions?.gate_number && (
        <GateCard
          gateNumber={decisions.gate_number}
          conceptName={decisions?.concept_id ? (CURRICULUM[decisions.concept_id]?.name ?? decisions.concept_id) : ''}
          onSubmit={() => {}}
          disabled
          attempts={decisions.attempts_used}
          result={{
            passed: decisions.gate_passed ?? false,
            xpEarned: decisions.xp_earned,
            passedWithHelp: decisions.passed_with_help,
          }}
        />
      )}

      {/* Conceito Concluído */}
      {isConceptComplete && decisions?.concept_id && (
        <ConceptComplete
          conceptName={CURRICULUM[decisions.concept_id]?.name ?? decisions.concept_id}
          xpEarned={decisions.xp_earned}
          nextConceptName={
            getNextConcept(decisions.concept_id)
              ? CURRICULUM[getNextConcept(decisions.concept_id)!]?.name
              : null
          }
          onNextConcept={
            getNextConcept(decisions.concept_id) && onSendGateResponse
              ? () => onSendGateResponse('bora próximo conceito')
              : undefined
          }
          onGoToHub={
            onSendGateResponse
              ? () => onSendGateResponse('voltar ao hub')
              : undefined
          }
        />
      )}
    </div>
  )
}

function renderMarkdown(content: string) {
  return content.split('```').map((block, i) => {
    if (i % 2 === 1) {
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
  })
}
