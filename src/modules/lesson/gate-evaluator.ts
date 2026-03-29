// Avaliador de Portões (Gates)
// Usa Claude Sonnet para avaliar respostas do aluno nos portões de compreensão e prática

import { claude } from '../../services/claude.js'
import { logger } from '../../utils/logger.js'
import type { ConversationState } from '../../db/schema.js'

export interface GateResult {
  passed: boolean
  feedback: string
  xpEarned: number
  attemptsUsed: number
  passedWithHelp: boolean
}

interface ConceptInfo {
  id: string
  name: string
  key_points: string[]
  exercise?: string
  solution?: string
}

const GATE_SYSTEM_PROMPT = `Você é um avaliador de aprendizado. Avalie a resposta do aluno e retorne APENAS JSON:
{
  "passed": true/false,
  "feedback": "feedback encorajador para o aluno",
  "show_solution": true/false
}

Regras:
- Seja generoso: se o aluno demonstrou compreensão geral, aprove
- NUNCA diga "errado" — use "Quase!", "Boa tentativa!", "Vamos ajustar..."
- Se reprovar, dê dica específica do que faltou
- Português brasileiro casual`

export async function evaluateGate(
  gateNumber: 1 | 2,
  userResponse: string,
  concept: ConceptInfo,
  state: ConversationState,
): Promise<GateResult> {
  const context = state.context as Record<string, unknown>
  const attempts = ((context.gateAttempts as number) || 0) + 1
  const maxAttempts = gateNumber === 2 ? 3 : 2

  try {
    let evaluationPrompt: string

    if (gateNumber === 1) {
      evaluationPrompt = `Portão 1 (Compreensão) — Conceito: ${concept.name}
Pontos-chave que o aluno deveria mencionar:
${concept.key_points.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Resposta do aluno: "${userResponse}"

Avalie: o aluno demonstrou compreensão geral? Não precisa ser perfeito.
Se sim, passed=true. Se não, passed=false e explique o que faltou.`
    } else {
      evaluationPrompt = `Portão 2 (Prática) — Conceito: ${concept.name}
Exercício: ${concept.exercise ?? 'exercício prático de ' + concept.name}
Solução esperada (referência): ${concept.solution ?? 'variações válidas aceitas'}
Tentativa: ${attempts} de ${maxAttempts}

Código do aluno: "${userResponse}"

Avalie: o código está correto ou próximo do correto?
Aceite variações válidas (let/const/var, aspas simples/duplas, etc).
Se tentativa ${attempts} de ${maxAttempts} e errado, ${attempts >= maxAttempts ? 'mostre a solução (show_solution=true)' : 'dê dica progressiva'}.`
    }

    const response = await claude.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: GATE_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: evaluationPrompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      logger.warn('Gate evaluator: resposta sem JSON', { gateNumber, text })
      return {
        passed: false,
        feedback: 'Hmm, me perdi avaliando. Tenta de novo? 😅',
        xpEarned: 0,
        attemptsUsed: attempts,
        passedWithHelp: false,
      }
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      passed: boolean
      feedback: string
      show_solution?: boolean
    }

    // Calcular XP
    let xpEarned = 0
    let passedWithHelp = false

    if (parsed.passed) {
      if (gateNumber === 1) {
        xpEarned = 30
      } else {
        // Portão 2: XP depende da tentativa
        if (attempts === 1) xpEarned = 50
        else if (attempts === 2) xpEarned = 40
        else xpEarned = 30
      }
    } else if (gateNumber === 2 && attempts >= maxAttempts) {
      // Portão 2: 3 falhas → mostra solução, dá XP parcial
      passedWithHelp = true
      xpEarned = 25
      parsed.passed = true // Marca como passado (com ajuda)
    }

    return {
      passed: parsed.passed,
      feedback: parsed.feedback,
      xpEarned,
      attemptsUsed: attempts,
      passedWithHelp,
    }
  } catch (error) {
    logger.error('Erro no gate evaluator', {
      gateNumber,
      error: error instanceof Error ? error.message : String(error),
    })

    return {
      passed: false,
      feedback: gateNumber === 1
        ? 'Me conta mais! Tenta explicar o que entendeu 😊'
        : 'Hmm, tenta de novo! Lembra da dica que dei 💪',
      xpEarned: 0,
      attemptsUsed: attempts,
      passedWithHelp: false,
    }
  }
}
