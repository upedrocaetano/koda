// Handler de Aula — gerencia o fluxo de ensino, portões e progresso
// Usa Context Builder para montar prompt de 6 camadas e Claude Sonnet como AI Engine

import { claude } from '../../services/claude.js'
import { logger } from '../../utils/logger.js'
import { supabase } from '../../services/supabase.js'
import { buildLessonContext } from '../../core/context-builder.js'
import { evaluateGate } from './gate-evaluator.js'
import { setState } from '../../db/queries/conversation-state.js'
import type { User, ConversationState, ConversationStateEnum } from '../../db/schema.js'

export interface LessonDecisions {
  gate_passed: boolean | null
  xp_earned: number
  next_state: ConversationStateEnum
  mastery_update: string | null
  concept_id: string | null
}

export interface LessonResult {
  responseText: string
  decisions: LessonDecisions
}

// Currículo em memória (módulo 1 — lógica de programação)
const CURRICULUM: Record<string, {
  id: string
  name: string
  analogy: string
  key_points: string[]
  exercise: string
  solution: string
}> = {
  variaveis: {
    id: 'variaveis',
    name: 'Variáveis',
    analogy: 'Variável é como uma caixa com etiqueta — você dá um nome e guarda algo dentro',
    key_points: [
      'Variável guarda um valor na memória',
      'Tem um nome (identificador) que você escolhe',
      'O valor pode mudar (por isso "variável")',
      'Em JavaScript: let nome = "Pedro"',
    ],
    exercise: 'Crie uma variável chamada `nome` com seu nome e outra chamada `idade` com sua idade',
    solution: 'let nome = \'Pedro\'\nlet idade = 25',
  },
  'tipos-de-dados': {
    id: 'tipos-de-dados',
    name: 'Tipos de Dados',
    analogy: 'Tipos são como categorias de produtos no mercado — cada prateleira tem seu tipo',
    key_points: [
      'String = texto, sempre entre aspas',
      'Number = números, sem aspas',
      'Boolean = verdadeiro ou falso (true/false)',
      'JavaScript escolhe o tipo automaticamente',
    ],
    exercise: 'Crie 3 variáveis: uma string com seu nome, um number com sua idade, e um boolean dizendo se gosta de café',
    solution: 'let nome = \'Pedro\'\nlet idade = 25\nlet gostaDeCafe = true',
  },
  condicionais: {
    id: 'condicionais',
    name: 'Condicionais',
    analogy: 'Condicional é como um semáforo — se verde, anda; se vermelho, para',
    key_points: [
      'if verifica uma condição (verdadeiro ou falso)',
      'Se true, executa o bloco dentro das chaves {}',
      'else é o "senão" — o que acontece se for false',
      'Pode encadear com else if para mais opções',
    ],
    exercise: 'Crie uma variável `hora` com um número. Se for maior que 18, mostre "Boa noite", senão mostre "Bom dia"',
    solution: 'let hora = 20\nif (hora > 18) {\n  console.log(\'Boa noite\')\n} else {\n  console.log(\'Bom dia\')\n}',
  },
}

const CONCEPT_ORDER = ['variaveis', 'tipos-de-dados', 'condicionais']

function getCurrentConcept(state: ConversationState): string {
  const context = state.context as Record<string, unknown>
  return (context.currentConceptId as string) || CONCEPT_ORDER[0]
}

function getNextConcept(currentId: string): string | null {
  const idx = CONCEPT_ORDER.indexOf(currentId)
  if (idx < 0 || idx >= CONCEPT_ORDER.length - 1) return null
  return CONCEPT_ORDER[idx + 1]
}

const TIMEOUT_MS = 15_000

export async function handleLesson(
  user: User,
  message: string,
  state: ConversationState,
): Promise<LessonResult> {
  const currentState = state.current_state as ConversationStateEnum
  const conceptId = getCurrentConcept(state)
  const concept = CURRICULUM[conceptId]
  const stateContext = state.context as Record<string, unknown>

  if (!concept) {
    return {
      responseText: 'Parabéns! 🎉 Você completou o módulo de Lógica de Programação! Manda "bora" no HUB pra ver o que vem a seguir!',
      decisions: {
        gate_passed: null,
        xp_earned: 0,
        next_state: 'HUB',
        mastery_update: null,
        concept_id: null,
      },
    }
  }

  try {
    // Se estamos em GATE_1 ou GATE_2, usar o avaliador
    if (currentState === 'GATE_1' || currentState === 'GATE_2') {
      const gateNumber = currentState === 'GATE_1' ? 1 : 2
      const gateResult = await evaluateGate(gateNumber, message, concept, state)

      if (gateResult.passed) {
        // Atualizar progresso
        await updateProgress(user.id, conceptId, gateNumber, gateResult.xpEarned)

        // Determinar próximo estado
        let nextState: ConversationStateEnum
        let nextContext: Record<string, unknown>

        if (gateNumber === 1) {
          // Portão 1 passou → ir para Portão 2
          nextState = 'GATE_2'
          nextContext = { ...stateContext, gateAttempts: 0, currentConceptId: conceptId }
        } else {
          // Portão 2 passou → próximo conceito ou módulo completo
          const nextConceptId = getNextConcept(conceptId)
          if (nextConceptId) {
            nextState = 'LESSON'
            nextContext = { ...stateContext, gateAttempts: 0, currentConceptId: nextConceptId }
          } else {
            nextState = 'HUB'
            nextContext = { ...stateContext, gateAttempts: 0, currentConceptId: null }
          }
        }

        await setState(user.id, nextState, nextContext)

        const helpNote = gateResult.passedWithHelp ? ' (com ajuda)' : ''

        return {
          responseText: gateResult.feedback,
          decisions: {
            gate_passed: true,
            xp_earned: gateResult.xpEarned,
            next_state: nextState,
            mastery_update: `gate_${gateNumber}_passed${helpNote}`,
            concept_id: conceptId,
          },
        }
      } else {
        // Não passou — incrementar tentativas
        const newAttempts = gateResult.attemptsUsed
        await setState(user.id, currentState, { ...stateContext, gateAttempts: newAttempts })

        return {
          responseText: gateResult.feedback,
          decisions: {
            gate_passed: false,
            xp_earned: 0,
            next_state: currentState,
            mastery_update: null,
            concept_id: conceptId,
          },
        }
      }
    }

    // Estado LESSON normal — usar Context Builder + Claude
    const context = await buildLessonContext(user, message, state, concept)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

    let response
    try {
      response = await claude.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: context.systemPrompt,
        messages: [{ role: 'user', content: context.userMessage }],
      })
    } finally {
      clearTimeout(timeout)
    }

    const rawText = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)

    let responseText: string
    let decisions: LessonDecisions = {
      gate_passed: null,
      xp_earned: 0,
      next_state: 'LESSON',
      mastery_update: null,
      concept_id: conceptId,
    }

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      responseText = parsed.response_text ?? rawText

      const d = parsed.decisions || {}
      const nextState = d.next_state as ConversationStateEnum | null

      decisions = {
        gate_passed: d.gate_passed ?? null,
        xp_earned: d.xp_earned ?? 0,
        next_state: nextState ?? 'LESSON',
        mastery_update: d.mastery_update ?? null,
        concept_id: d.concept_id ?? conceptId,
      }

      // Se Claude sugeriu transição para GATE_1, atualizar estado
      if (nextState === 'GATE_1' || nextState === 'GATE_2') {
        await setState(user.id, nextState, { ...stateContext, gateAttempts: 0, currentConceptId: conceptId })
      }
    } else {
      responseText = rawText
    }

    return { responseText, decisions }
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === 'AbortError'

    logger.error('Erro no lesson handler', {
      userId: user.id,
      conceptId,
      error: error instanceof Error ? error.message : String(error),
    })

    return {
      responseText: isTimeout
        ? 'Hmm, demorei pra pensar. Me manda de novo? 🤔'
        : 'Ops, tive um problema aqui. Me manda de novo? 🙏',
      decisions: {
        gate_passed: null,
        xp_earned: 0,
        next_state: currentState,
        mastery_update: null,
        concept_id: conceptId,
      },
    }
  }
}

async function updateProgress(
  userId: string,
  conceptId: string,
  gateNumber: 1 | 2,
  xpEarned: number,
): Promise<void> {
  try {
    // Buscar progresso existente
    const { data: existing } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', userId)
      .eq('concept_id', conceptId)
      .single()

    if (existing) {
      const update: Record<string, unknown> = {
        attempts: (existing.attempts || 0) + 1,
        xp_earned: (existing.xp_earned || 0) + xpEarned,
        updated_at: new Date().toISOString(),
      }
      if (gateNumber === 1) update.gate_1_passed = true
      if (gateNumber === 2) {
        update.gate_2_passed = true
        update.completed_at = new Date().toISOString()
      }

      await supabase.from('progress').update(update).eq('id', existing.id)
    } else {
      await supabase.from('progress').insert({
        user_id: userId,
        concept_id: conceptId,
        gate_1_passed: gateNumber === 1,
        gate_2_passed: gateNumber === 2,
        attempts: 1,
        xp_earned: xpEarned,
        completed_at: gateNumber === 2 ? new Date().toISOString() : null,
      })
    }

    // Atualizar XP total do usuário
    const { data: userData } = await supabase
      .from('users')
      .select('total_xp')
      .eq('id', userId)
      .single()

    if (userData) {
      await supabase
        .from('users')
        .update({ total_xp: (userData.total_xp || 0) + xpEarned })
        .eq('id', userId)
    }
  } catch (error) {
    logger.warn('Falha ao atualizar progresso', {
      userId,
      conceptId,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
