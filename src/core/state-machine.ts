// Máquina de Estados da Conversa (FSM)
// Controla o fluxo IDLE→ONBOARDING→HUB→LESSON→GATE→HUB
// Função pura — sem side effects, persistência é feita separadamente

import type { IntentType } from './classifier.js'
import { logger } from '../utils/logger.js'

export type ConversationStateEnum =
  | 'IDLE'
  | 'ONBOARDING'
  | 'HUB'
  | 'LESSON'
  | 'GATE_1'
  | 'GATE_2'
  | 'GATE_3'
  | 'QUIZ'
  | 'DOUBT'
  | 'BREAK'
  | 'REVIEW'
  | 'PLAYGROUND'

export interface StateContext {
  isNewUser: boolean
  onboardingCompleted: boolean
  currentModuleId: number | null
  currentConceptId: string | null
  gateAttempts: number
  contextStack: string[]
}

export interface TransitionResult {
  newState: ConversationStateEnum
  action: string
  contextUpdate: Partial<StateContext>
}

// Tabela de transições — lookup table para facilitar visualização e manutenção
// Formato: [estadoAtual][intent] = handler(context) => TransitionResult
type TransitionHandler = (context: StateContext) => TransitionResult

const TRANSITION_TABLE: Record<string, Record<string, TransitionHandler>> = {
  IDLE: {
    greeting: (ctx) => {
      if (ctx.isNewUser && !ctx.onboardingCompleted) {
        return { newState: 'ONBOARDING', action: 'start_onboarding', contextUpdate: {} }
      }
      return { newState: 'HUB', action: 'show_hub', contextUpdate: {} }
    },
    _default: (ctx) => {
      if (ctx.isNewUser && !ctx.onboardingCompleted) {
        return { newState: 'ONBOARDING', action: 'start_onboarding', contextUpdate: {} }
      }
      return { newState: 'HUB', action: 'show_hub', contextUpdate: {} }
    },
  },

  ONBOARDING: {
    onboarding_response: () => ({
      newState: 'ONBOARDING', action: 'continue_onboarding', contextUpdate: {},
    }),
    // Quando onboarding completa, a lógica do pipeline marca onboardingCompleted
    // e na próxima msg o usuário vai para HUB
    _default: () => ({
      newState: 'ONBOARDING', action: 'continue_onboarding', contextUpdate: {},
    }),
  },

  HUB: {
    lesson_continue: () => ({
      newState: 'LESSON', action: 'start_lesson', contextUpdate: { gateAttempts: 0 },
    }),
    doubt: (ctx) => ({
      newState: 'DOUBT', action: 'answer_doubt',
      contextUpdate: { contextStack: [...ctx.contextStack, 'HUB'] },
    }),
    progress_check: () => ({
      newState: 'HUB', action: 'show_progress', contextUpdate: {},
    }),
    mood_check: () => ({
      newState: 'BREAK', action: 'take_break', contextUpdate: {},
    }),
    quiz_answer: () => ({
      newState: 'QUIZ', action: 'start_quiz', contextUpdate: {},
    }),
    greeting: () => ({
      newState: 'HUB', action: 'show_hub', contextUpdate: {},
    }),
    off_topic: () => ({
      newState: 'HUB', action: 'redirect_to_topic', contextUpdate: {},
    }),
    _default: () => ({
      newState: 'HUB', action: 'show_hub', contextUpdate: {},
    }),
  },

  LESSON: {
    lesson_continue: () => ({
      newState: 'GATE_1', action: 'start_gate_1', contextUpdate: { gateAttempts: 0 },
    }),
    lesson_explain_again: () => ({
      newState: 'LESSON', action: 're_explain', contextUpdate: {},
    }),
    doubt: (ctx) => ({
      newState: 'DOUBT', action: 'answer_doubt',
      contextUpdate: { contextStack: [...ctx.contextStack, 'LESSON'] },
    }),
    mood_check: () => ({
      newState: 'BREAK', action: 'take_break', contextUpdate: {},
    }),
    code_submission: () => ({
      newState: 'LESSON', action: 'evaluate_code', contextUpdate: {},
    }),
    _default: () => ({
      newState: 'LESSON', action: 'continue_lesson', contextUpdate: {},
    }),
  },

  GATE_1: {
    gate_response: (ctx) => ({
      // A decisão de aprovado/reprovado vem do AI Engine (structured output)
      // Aqui só registramos a tentativa
      newState: 'GATE_1', action: 'evaluate_gate_1',
      contextUpdate: { gateAttempts: ctx.gateAttempts + 1 },
    }),
    doubt: (ctx) => ({
      newState: 'DOUBT', action: 'answer_doubt',
      contextUpdate: { contextStack: [...ctx.contextStack, 'GATE_1'] },
    }),
    _default: (ctx) => ({
      newState: 'GATE_1', action: 'evaluate_gate_1',
      contextUpdate: { gateAttempts: ctx.gateAttempts + 1 },
    }),
  },

  GATE_2: {
    gate_response: (ctx) => ({
      newState: 'GATE_2', action: 'evaluate_gate_2',
      contextUpdate: { gateAttempts: ctx.gateAttempts + 1 },
    }),
    doubt: (ctx) => ({
      newState: 'DOUBT', action: 'answer_doubt',
      contextUpdate: { contextStack: [...ctx.contextStack, 'GATE_2'] },
    }),
    _default: (ctx) => ({
      newState: 'GATE_2', action: 'evaluate_gate_2',
      contextUpdate: { gateAttempts: ctx.gateAttempts + 1 },
    }),
  },

  GATE_3: {
    gate_response: (ctx) => ({
      newState: 'GATE_3', action: 'evaluate_gate_3',
      contextUpdate: { gateAttempts: ctx.gateAttempts + 1 },
    }),
    doubt: (ctx) => ({
      newState: 'DOUBT', action: 'answer_doubt',
      contextUpdate: { contextStack: [...ctx.contextStack, 'GATE_3'] },
    }),
    _default: (ctx) => ({
      newState: 'GATE_3', action: 'evaluate_gate_3',
      contextUpdate: { gateAttempts: ctx.gateAttempts + 1 },
    }),
  },

  QUIZ: {
    quiz_answer: () => ({
      newState: 'QUIZ', action: 'evaluate_quiz', contextUpdate: {},
    }),
    doubt: (ctx) => ({
      newState: 'DOUBT', action: 'answer_doubt',
      contextUpdate: { contextStack: [...ctx.contextStack, 'QUIZ'] },
    }),
    _default: () => ({
      newState: 'HUB', action: 'finish_quiz', contextUpdate: {},
    }),
  },

  DOUBT: {
    // Quando a dúvida é respondida, desempilha e volta ao estado anterior
    _default: (ctx) => {
      const stack = [...ctx.contextStack]
      const previousState = (stack.pop() || 'HUB') as ConversationStateEnum
      return {
        newState: previousState,
        action: 'return_from_doubt',
        contextUpdate: { contextStack: stack },
      }
    },
  },

  BREAK: {
    greeting: () => ({
      newState: 'HUB', action: 'return_from_break', contextUpdate: {},
    }),
    lesson_continue: () => ({
      newState: 'HUB', action: 'return_from_break', contextUpdate: {},
    }),
    _default: () => ({
      newState: 'BREAK', action: 'continue_break', contextUpdate: {},
    }),
  },

  REVIEW: {
    _default: () => ({
      newState: 'HUB', action: 'finish_review', contextUpdate: {},
    }),
  },

  PLAYGROUND: {
    _default: () => ({
      newState: 'PLAYGROUND', action: 'continue_playground', contextUpdate: {},
    }),
  },
}

// Export da tabela para visualização (AC14)
export { TRANSITION_TABLE }

/**
 * Função de transição pura — sem side effects.
 * Recebe estado atual, intent e contexto, retorna novo estado.
 */
export function transition(
  currentState: ConversationStateEnum,
  intent: IntentType | string,
  context: StateContext,
): TransitionResult {
  const stateHandlers = TRANSITION_TABLE[currentState]

  if (!stateHandlers) {
    logger.warn('Estado desconhecido na FSM', { currentState, intent })
    return { newState: currentState, action: 'no_op', contextUpdate: {} }
  }

  // Tentar handler específico para o intent
  const handler = stateHandlers[intent] || stateHandlers._default

  if (!handler) {
    // AC13: Transição inválida — retorna estado atual
    logger.warn('Transição inválida na FSM', { currentState, intent })
    return { newState: currentState, action: 'no_op', contextUpdate: {} }
  }

  return handler(context)
}
