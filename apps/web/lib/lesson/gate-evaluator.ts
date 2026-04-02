// Avaliador de Portões para Web App
// Adaptado de src/modules/lesson/gate-evaluator.ts

import { getOpenAI } from '@/lib/openai'

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
  "feedback": "feedback encorajador para o aluno em markdown"
}

Regras:
- Seja generoso: se o aluno demonstrou compreensão geral, aprove
- NUNCA diga "errado" — use "Quase!", "Boa tentativa!", "Vamos ajustar..."
- Se reprovar, dê dica específica do que faltou
- Use markdown para formatação (negrito, código, etc)
- Português brasileiro casual`

export async function evaluateGate(
  gateNumber: 1 | 2,
  userResponse: string,
  concept: ConceptInfo,
  gateAttempts: number,
): Promise<GateResult> {
  const attempts = gateAttempts + 1
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
Se tentativa ${attempts} de ${maxAttempts} e errado, ${attempts >= maxAttempts ? 'mostre a solução (inclua no feedback)' : 'dê dica progressiva'}.`
    }

    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 500,
      messages: [
        { role: 'system', content: GATE_SYSTEM_PROMPT },
        { role: 'user', content: evaluationPrompt },
      ],
    })

    const text = response.choices[0]?.message?.content ?? ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
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
    }

    let xpEarned = 0
    let passedWithHelp = false

    if (parsed.passed) {
      if (gateNumber === 1) {
        xpEarned = 30
      } else {
        if (attempts === 1) xpEarned = 50
        else if (attempts === 2) xpEarned = 40
        else xpEarned = 30
      }
    } else if (gateNumber === 2 && attempts >= maxAttempts) {
      passedWithHelp = true
      xpEarned = 25
      parsed.passed = true
    }

    return {
      passed: parsed.passed,
      feedback: parsed.feedback,
      xpEarned,
      attemptsUsed: attempts,
      passedWithHelp,
    }
  } catch (error) {
    console.error('Erro no gate evaluator:', error)
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
