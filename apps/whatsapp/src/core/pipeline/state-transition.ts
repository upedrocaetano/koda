// Etapa 5 — State Machine
// Consulta estado atual no Supabase, executa transição via FSM, persiste novo estado

import { transition, type ConversationStateEnum, type StateContext } from '../state-machine.js'
import { getState, setState } from '../../db/queries/conversation-state.js'
import { logger } from '../../utils/logger.js'

export interface TransitionResult {
  previousState: string
  newState: string
  action: string
}

const DEFAULT_CONTEXT: StateContext = {
  isNewUser: false,
  onboardingCompleted: false,
  currentModuleId: null,
  currentConceptId: null,
  gateAttempts: 0,
  contextStack: [],
}

export async function stateTransition(userId: string, intent: string): Promise<TransitionResult> {
  // Buscar estado atual do banco
  const stateRecord = await getState(userId)

  const currentState: ConversationStateEnum = (stateRecord?.current_state as ConversationStateEnum) || 'IDLE'
  const context: StateContext = {
    ...DEFAULT_CONTEXT,
    ...(stateRecord?.context as Partial<StateContext> || {}),
  }

  // Executar transição pura
  const result = transition(currentState, intent, context)

  // Persistir novo estado
  try {
    const newContext = { ...context, ...result.contextUpdate }
    await setState(userId, result.newState, newContext)
  } catch (error) {
    logger.warn('Falha ao persistir estado', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    })
    // Não bloqueia o pipeline — estado pode ser recuperado na próxima mensagem
  }

  return {
    previousState: currentState,
    newState: result.newState,
    action: result.action,
  }
}
