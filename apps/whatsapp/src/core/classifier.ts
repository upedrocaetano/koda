// Classificador de Intenção — usa Claude Haiku para identificar o que o aluno quer
// Chamado na Etapa 4 do pipeline

import { claude } from '../services/claude.js'
import { logger } from '../utils/logger.js'

export type IntentType =
  | 'greeting'
  | 'onboarding_response'
  | 'lesson_continue'
  | 'lesson_explain_again'
  | 'code_submission'
  | 'exercise_answer'
  | 'gate_response'
  | 'doubt'
  | 'progress_check'
  | 'mood_check'
  | 'quiz_answer'
  | 'off_topic'
  | 'audio'
  | 'image'
  | 'unknown'

export interface ClassificationResult {
  intent: IntentType
  confidence: number
}

const VALID_INTENTS = new Set<string>([
  'greeting', 'onboarding_response', 'lesson_continue', 'lesson_explain_again',
  'code_submission', 'exercise_answer', 'gate_response', 'doubt',
  'progress_check', 'mood_check', 'quiz_answer', 'off_topic', 'audio', 'image',
])

const CLASSIFIER_SYSTEM_PROMPT = `Você é um classificador de intenção para o Koda, um professor de programação via WhatsApp.

Analise a mensagem do aluno e classifique a intenção considerando o estado atual da conversa.

Intenções possíveis: greeting, onboarding_response, lesson_continue, lesson_explain_again, code_submission, exercise_answer, gate_response, doubt, progress_check, mood_check, quiz_answer, off_topic, audio, image

Regras de contexto:
- Se estado é ONBOARDING e mensagem é curta ("sim", "não", nome), classifique como onboarding_response
- Se estado contém GATE, classifique como gate_response (a menos que seja claramente outra coisa)
- Se mensagem contém código (chaves, parênteses, keywords como function/var/let/print), prefira code_submission
- Se mensagem contém indicador de áudio, classifique como audio
- Se mensagem contém indicador de imagem, classifique como image

Responda APENAS com JSON válido: {"intent": "...", "confidence": 0.0-1.0}`

export async function classifyIntent(
  message: string,
  currentState: string,
): Promise<ClassificationResult> {
  const startTime = Date.now()

  try {
    const response = await claude.messages.create({
      model: 'claude-haiku-4-5-20250514',
      max_tokens: 100,
      system: CLASSIFIER_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Estado atual: ${currentState}\nMensagem do aluno: ${message}`,
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''

    // Extrair JSON da resposta
    const jsonMatch = text.match(/\{[^}]+\}/)
    if (!jsonMatch) {
      logger.warn('Classifier retornou formato inválido', { text })
      return { intent: 'unknown', confidence: 0 }
    }

    const parsed = JSON.parse(jsonMatch[0]) as { intent: string; confidence: number }

    // Validar intent
    if (!VALID_INTENTS.has(parsed.intent)) {
      logger.warn('Classifier retornou intent inválido', { intent: parsed.intent })
      return { intent: 'unknown', confidence: 0 }
    }

    // AC7: Se confiança < 0.5, retorna unknown
    if (parsed.confidence < 0.5) {
      logger.info('Intent com confiança baixa, retornando unknown', {
        originalIntent: parsed.intent,
        confidence: parsed.confidence,
      })
      return { intent: 'unknown', confidence: parsed.confidence }
    }

    const latencyMs = Date.now() - startTime
    logger.info(`Intent classified as ${parsed.intent} (confidence: ${parsed.confidence}) in ${latencyMs}ms`)

    return {
      intent: parsed.intent as IntentType,
      confidence: parsed.confidence,
    }
  } catch (error) {
    // AC8: Fallback sem quebrar o pipeline
    const latencyMs = Date.now() - startTime
    logger.warn('Classifier falhou, retornando unknown', {
      error: error instanceof Error ? error.message : String(error),
      latencyMs,
    })
    return { intent: 'unknown', confidence: 0 }
  }
}
