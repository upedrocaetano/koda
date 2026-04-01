// Etapa 4 — Classify Intent
// Usa o classificador Haiku para identificar a intenção do aluno

import type { User } from '../../db/schema.js'
import { classifyIntent as classify, type ClassificationResult } from '../classifier.js'

export interface IntentResult {
  intent: string
  confidence: number
}

export async function classifyIntent(text: string, user: User): Promise<IntentResult> {
  // Determinar estado atual para contexto do classificador
  const currentState = !user.onboarding_completed ? 'ONBOARDING' : 'HUB'

  const result: ClassificationResult = await classify(text, currentState)

  return {
    intent: result.intent,
    confidence: result.confidence,
  }
}
