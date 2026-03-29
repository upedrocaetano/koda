// Pipeline de 10 etapas — coração do processamento de mensagens do Koda
// Cada mensagem do aluno passa sequencialmente por todas as etapas

import { logger } from '../utils/logger.js'
import { sendMessage, sendTypingIndicator } from '../services/evolution.js'
import { receive } from './pipeline/receive.js'
import { identifyUser } from './pipeline/identify-user.js'
import { rateLimit } from './pipeline/rate-limit.js'
import { classifyIntent } from './pipeline/classify-intent.js'
import { stateTransition } from './pipeline/state-transition.js'
import { buildContext } from './pipeline/build-context.js'
import { aiEngine } from './pipeline/ai-engine.js'
import { postProcess } from './pipeline/post-process.js'
import { formatSend } from './pipeline/format-send.js'
import { logUpdate } from './pipeline/log-update.js'
import { handleOnboarding } from '../modules/onboarding/handler.js'
import { handleLesson } from '../modules/lesson/handler.js'
import { getState } from '../db/queries/conversation-state.js'

export interface PipelineInput {
  phone: string
  text: string | null
  messageType: 'text' | 'audio' | 'image' | 'unknown'
  messageId: string
  rawPayload: unknown
}

export interface PipelineResult {
  success: boolean
  userId: string | null
  responseText: string | null
  intent: string | null
  xpEarned: number
  newState: string | null
  latencyMs: number
  error?: string
}

const FALLBACK_MESSAGE = 'Desculpa, tive um problema. Tenta de novo em alguns segundos? 🙏'

export async function processMessage(input: PipelineInput): Promise<PipelineResult> {
  const startTime = Date.now()

  try {
    // Etapa 1 — Receive & Parse
    const parsed = receive(input)

    // Enviar "digitando..." antes de processar
    await sendTypingIndicator(input.phone)

    // Etapa 2 — Identify User
    const user = await identifyUser(input.phone)

    // Etapa 3 — Rate Limit
    const rateLimitResult = rateLimit(input.phone)
    if (rateLimitResult.limited) {
      await sendMessage(input.phone, rateLimitResult.message!)
      return {
        success: true,
        userId: user.id,
        responseText: rateLimitResult.message!,
        intent: 'rate_limited',
        xpEarned: 0,
        newState: null,
        latencyMs: Date.now() - startTime,
      }
    }

    // Verificar se está em onboarding — desviar para handler dedicado
    if (!user.onboarding_completed) {
      const stateRecord = await getState(user.id)
      const currentState = stateRecord?.current_state ?? 'IDLE'
      const onboardingStep = (stateRecord?.context as Record<string, unknown>)?.onboarding_step as number | undefined

      // IDLE ou ONBOARDING sem step = step 0 (primeira mensagem)
      const step = currentState === 'ONBOARDING' && onboardingStep != null
        ? onboardingStep
        : 0

      const onboardingResult = await handleOnboarding(user, parsed.text, step)

      // Enviar resposta
      await formatSend(input.phone, onboardingResult.responseText)

      const latencyMs = Date.now() - startTime
      logger.info('Onboarding step completed', {
        phone: input.phone,
        step,
        nextStep: onboardingResult.nextStep,
        latencyMs,
      })

      return {
        success: true,
        userId: user.id,
        responseText: onboardingResult.responseText,
        intent: 'onboarding',
        xpEarned: 0,
        newState: onboardingResult.nextStep === null ? 'HUB' : 'ONBOARDING',
        latencyMs,
      }
    }

    // Verificar se está em aula — desviar para lesson handler
    const lessonStates = ['LESSON', 'GATE_1', 'GATE_2'] as const
    const stateForLesson = await getState(user.id)
    const currentLessonState = stateForLesson?.current_state as string | undefined

    if (currentLessonState && lessonStates.includes(currentLessonState as typeof lessonStates[number])) {
      const lessonResult = await handleLesson(user, parsed.text, stateForLesson!)

      await formatSend(input.phone, lessonResult.responseText)

      const latencyMs = Date.now() - startTime
      logger.info('Lesson step completed', {
        phone: input.phone,
        state: currentLessonState,
        conceptId: lessonResult.decisions.concept_id,
        gatePassed: lessonResult.decisions.gate_passed,
        xpEarned: lessonResult.decisions.xp_earned,
        latencyMs,
      })

      return {
        success: true,
        userId: user.id,
        responseText: lessonResult.responseText,
        intent: 'lesson',
        xpEarned: lessonResult.decisions.xp_earned,
        newState: lessonResult.decisions.next_state,
        latencyMs,
      }
    }

    // Etapa 4 — Classify Intent
    const intentResult = await classifyIntent(parsed.text, user)

    // Etapa 5 — State Machine
    const transition = await stateTransition(user.id, intentResult.intent)

    // Etapa 6 — Build Context
    const context = await buildContext(user, parsed.text, intentResult, transition)

    // Etapa 7 — AI Engine
    const aiResult = await aiEngine(context.systemPrompt, context.userMessage)

    // Etapa 8 — Post-Process
    const processed = await postProcess(user, aiResult)

    // Etapa 9 — Format & Send
    await formatSend(input.phone, processed.responseText)

    // Etapa 10 — Log & Update
    await logUpdate(user, input, intentResult, aiResult, processed, Date.now() - startTime)

    const latencyMs = Date.now() - startTime
    logger.info('Pipeline completed', { phone: input.phone, latencyMs })

    return {
      success: true,
      userId: user.id,
      responseText: processed.responseText,
      intent: intentResult.intent,
      xpEarned: processed.xpEarned,
      newState: transition.newState,
      latencyMs,
    }
  } catch (error) {
    const latencyMs = Date.now() - startTime
    logger.error('Pipeline failed', {
      phone: input.phone,
      error: error instanceof Error ? error.message : String(error),
      latencyMs,
    })

    // Enviar mensagem de fallback — NUNCA deixar o aluno sem resposta
    try {
      await sendMessage(input.phone, FALLBACK_MESSAGE)
    } catch {
      logger.error('Failed to send fallback message', { phone: input.phone })
    }

    return {
      success: false,
      userId: null,
      responseText: FALLBACK_MESSAGE,
      intent: null,
      xpEarned: 0,
      newState: null,
      latencyMs,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
