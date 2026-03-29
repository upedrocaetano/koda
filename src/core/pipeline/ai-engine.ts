// Etapa 7 — AI Engine
// Chama Claude Sonnet com o contexto montado. Timeout de 15s.

import { claude } from '../../services/claude.js'
import { logger } from '../../utils/logger.js'

export interface AIResult {
  responseText: string
  decisions: {
    gate_passed: boolean
    xp_earned: number
    next_state: string | null
    mastery_update: unknown | null
  }
  tokensIn: number
  tokensOut: number
  latencyMs: number
  model: string
}

export async function aiEngine(systemPrompt: string, userMessage: string): Promise<AIResult> {
  const startTime = Date.now()

  const response = await claude.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  const latencyMs = Date.now() - startTime
  const rawText = response.content[0].type === 'text' ? response.content[0].text : ''

  // Tentar parsear JSON da resposta
  let responseText: string
  let decisions = { gate_passed: false, xp_earned: 0, next_state: null as string | null, mastery_update: null }

  try {
    // Extrair JSON (pode vir com markdown code block)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      responseText = parsed.response_text ?? rawText
      decisions = {
        gate_passed: parsed.decisions?.gate_passed ?? false,
        xp_earned: parsed.decisions?.xp_earned ?? 0,
        next_state: parsed.decisions?.next_state ?? null,
        mastery_update: parsed.decisions?.mastery_update ?? null,
      }
    } else {
      // Se não veio JSON, usar texto direto
      responseText = rawText
    }
  } catch {
    logger.warn('Falha ao parsear JSON do Claude, usando texto direto', { rawText: rawText.substring(0, 200) })
    responseText = rawText
  }

  return {
    responseText,
    decisions,
    tokensIn: response.usage.input_tokens,
    tokensOut: response.usage.output_tokens,
    latencyMs,
    model: response.model,
  }
}
