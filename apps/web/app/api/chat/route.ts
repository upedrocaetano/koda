import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { claude } from '@/lib/claude'
import { evaluateGate } from '@/lib/lesson/gate-evaluator'
import { buildLessonContext } from '@/lib/lesson/context-builder'
import {
  CURRICULUM,
  CONCEPT_ORDER,
  getCurrentConcept,
  getNextConcept,
} from '@/lib/lesson/curriculum'

type ConversationStateEnum =
  | 'IDLE' | 'ONBOARDING' | 'HUB' | 'LESSON'
  | 'GATE_1' | 'GATE_2' | 'GATE_3'
  | 'QUIZ' | 'DOUBT' | 'BREAK' | 'REVIEW' | 'PLAYGROUND'

export interface ChatApiResponse {
  id: string | null
  response: string
  state: ConversationStateEnum
  decisions: {
    gate_passed: boolean | null
    xp_earned: number
    next_state: ConversationStateEnum
    concept_id: string | null
    gate_number: 1 | 2 | null
    attempts_used: number
    passed_with_help: boolean
  }
  lesson_context: {
    module_name: string
    concept_name: string
    concept_id: string
  } | null
}

export async function POST(request: Request) {
  const { message, userId } = await request.json()

  if (!message || !userId) {
    return NextResponse.json(
      { error: 'message and userId are required' },
      { status: 400 },
    )
  }

  const supabase = await createSupabaseServerClient()

  // 1. Buscar estado da conversa
  const { data: stateRow } = await supabase
    .from('conversation_state')
    .select('*')
    .eq('user_id', userId)
    .single()

  let currentState = (stateRow?.current_state as ConversationStateEnum) || 'HUB'
  const stateContext = (stateRow?.context as Record<string, unknown>) || {}

  // 2. Buscar perfil do usuário
  const { data: userProfile } = await supabase
    .from('users')
    .select('name, level, objective, total_xp, current_streak')
    .eq('id', userId)
    .single()

  const profile = userProfile || {
    name: null,
    level: 'beginner',
    objective: null,
    total_xp: 0,
    current_streak: 0,
  }

  // 3. Salvar mensagem do usuário
  await supabase.from('interactions').insert({
    user_id: userId,
    role: 'user',
    content: message,
  })

  // 4. Classificar intent
  const intent = classifyIntent(message, currentState)

  // 5. Processar baseado no estado atual
  let responseText: string
  let newState: ConversationStateEnum = currentState
  let decisions = makeEmptyDecisions(currentState)
  const conceptId = getCurrentConcept(stateContext)
  const concept = CURRICULUM[conceptId]

  try {
    if (currentState === 'GATE_1' || currentState === 'GATE_2') {
      // Avaliar portão
      const gateNumber: 1 | 2 = currentState === 'GATE_1' ? 1 : 2
      const gateAttempts = (stateContext.gateAttempts as number) || 0

      if (!concept) {
        responseText = 'Conceito não encontrado. Voltando ao Hub...'
        newState = 'HUB'
      } else {
        const result = await evaluateGate(gateNumber, message, concept, gateAttempts)
        responseText = result.feedback

        if (result.passed) {
          await updateProgress(supabase, userId, conceptId, gateNumber, result.xpEarned)

          if (gateNumber === 1) {
            newState = 'GATE_2'
            await upsertState(supabase, userId, 'GATE_2', {
              ...stateContext, gateAttempts: 0, currentConceptId: conceptId,
            })
          } else {
            const nextConceptId = getNextConcept(conceptId)
            if (nextConceptId) {
              newState = 'LESSON'
              await upsertState(supabase, userId, 'LESSON', {
                ...stateContext, gateAttempts: 0, currentConceptId: nextConceptId,
              })
            } else {
              newState = 'HUB'
              await upsertState(supabase, userId, 'HUB', {
                ...stateContext, gateAttempts: 0, currentConceptId: null,
              })
            }
          }

          decisions = {
            gate_passed: true,
            xp_earned: result.xpEarned,
            next_state: newState,
            concept_id: conceptId,
            gate_number: gateNumber,
            attempts_used: result.attemptsUsed,
            passed_with_help: result.passedWithHelp,
          }
        } else {
          await upsertState(supabase, userId, currentState, {
            ...stateContext, gateAttempts: result.attemptsUsed,
          })

          decisions = {
            gate_passed: false,
            xp_earned: 0,
            next_state: currentState,
            concept_id: conceptId,
            gate_number: gateNumber,
            attempts_used: result.attemptsUsed,
            passed_with_help: false,
          }
        }
      }
    } else if (currentState === 'LESSON' || (currentState === 'HUB' && intent === 'lesson_continue')) {
      // Transicionar para LESSON se vindo do HUB
      if (currentState === 'HUB') {
        const firstConcept = (stateContext.currentConceptId as string) || CONCEPT_ORDER[0]
        await upsertState(supabase, userId, 'LESSON', {
          ...stateContext, gateAttempts: 0, currentConceptId: firstConcept,
        })
        currentState = 'LESSON'
        newState = 'LESSON'
      }

      const activeConcept = concept || CURRICULUM[CONCEPT_ORDER[0]]
      const context = await buildLessonContext(
        profile, message, currentState, activeConcept,
        (stateContext.gateAttempts as number) || 0,
        supabase, userId,
      )

      const aiResponse = await claude.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: context.systemPrompt,
        messages: [{ role: 'user', content: context.userMessage }],
      })

      const rawText = aiResponse.content[0].type === 'text' ? aiResponse.content[0].text : ''
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)

      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0])
          responseText = parsed.response_text ?? rawText
          const d = parsed.decisions || {}
          const suggestedState = d.next_state as ConversationStateEnum | null

          if (suggestedState === 'GATE_1' || suggestedState === 'GATE_2') {
            newState = suggestedState
            await upsertState(supabase, userId, suggestedState, {
              ...stateContext, gateAttempts: 0, currentConceptId: conceptId,
            })
          }

          decisions = {
            gate_passed: d.gate_passed ?? null,
            xp_earned: d.xp_earned ?? 0,
            next_state: suggestedState ?? newState,
            concept_id: d.concept_id ?? conceptId,
            gate_number: null,
            attempts_used: 0,
            passed_with_help: false,
          }
        } catch {
          responseText = rawText
        }
      } else {
        responseText = rawText
      }
    } else {
      // HUB ou outros estados — resposta conversacional
      responseText = await generateHubResponse(message, profile, supabase, userId)
      newState = currentState
    }
  } catch (error) {
    console.error('Erro no pipeline de chat:', error)
    responseText = 'Ops, tive um problema aqui. Me manda de novo? 🙏'
  }

  // 6. Salvar resposta do assistente
  const { data: saved } = await supabase
    .from('interactions')
    .insert({
      user_id: userId,
      role: 'assistant',
      content: responseText,
    })
    .select('id')
    .single()

  // 7. Montar contexto da aula para o frontend
  const activeConceptForResponse = CURRICULUM[getCurrentConcept(stateContext)]
  const lessonContext =
    (newState === 'LESSON' || newState === 'GATE_1' || newState === 'GATE_2') && activeConceptForResponse
      ? {
          module_name: activeConceptForResponse.moduleName,
          concept_name: activeConceptForResponse.name,
          concept_id: activeConceptForResponse.id,
        }
      : null

  const apiResponse: ChatApiResponse = {
    id: saved?.id ?? null,
    response: responseText,
    state: newState,
    decisions,
    lesson_context: lessonContext,
  }

  return NextResponse.json(apiResponse)
}

function classifyIntent(message: string, currentState: ConversationStateEnum) {
  const lower = message.toLowerCase().trim()
  if (currentState === 'GATE_1' || currentState === 'GATE_2') return 'gate_response'
  if (/^(oi|olá|ola|hey|fala|e aí|eae)\b/.test(lower)) return 'greeting'
  if (/\b(bora|aula|aprender|continuar|próximo|proximo|começ|comec|vamo)\b/.test(lower)) return 'lesson_continue'
  if (/\b(cansa|tirei|pausa|chega)\b/.test(lower)) return 'mood_check'
  if (/\b(como|por que|o que é|porque|dúvida|duvida|explica|não entendi)\b/.test(lower)) return 'doubt'
  return 'general'
}

function makeEmptyDecisions(currentState: ConversationStateEnum) {
  return {
    gate_passed: null as boolean | null,
    xp_earned: 0,
    next_state: currentState,
    concept_id: null as string | null,
    gate_number: null as 1 | 2 | null,
    attempts_used: 0,
    passed_with_help: false,
  }
}

async function upsertState(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  state: string,
  context: Record<string, unknown>,
) {
  await supabase
    .from('conversation_state')
    .upsert(
      { user_id: userId, current_state: state, context, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    )
}

async function updateProgress(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  conceptId: string,
  gateNumber: 1 | 2,
  xpEarned: number,
) {
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
}

async function generateHubResponse(
  message: string,
  profile: { name: string | null; level: string; total_xp: number; current_streak: number },
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
): Promise<string> {
  try {
    const { data: recentMessages } = await supabase
      .from('interactions')
      .select('role, content')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(6)

    const history = recentMessages
      ?.reverse()
      .map(m => `${m.role === 'user' ? 'Aluno' : 'Koda'}: ${m.content}`)
      .join('\n') || ''

    const response = await claude.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      system: `Você é o Koda, professor de programação. Fala português brasileiro casual.
O aluno ${profile.name || 'estudante'} tem ${profile.total_xp} XP (nível: ${profile.level}).
Streak: ${profile.current_streak} dias.

Você está no HUB — o menu principal. Ajude o aluno a decidir o que fazer:
- "bora" ou "aula" → começar/continuar aula
- Dúvidas → responder brevemente
- Saudações → cumprimentar e sugerir próxima ação

Use markdown para formatação. Seja breve e entusiasmado.`,
      messages: [
        ...(history ? [{ role: 'user' as const, content: `Histórico:\n${history}` }] : []),
        { role: 'user', content: message },
      ],
    })

    return response.content[0].type === 'text' ? response.content[0].text : 'Opa! Me manda de novo?'
  } catch {
    return `Olá${profile.name ? `, ${profile.name}` : ''}! 🟢\n\nSou o Koda, seu professor de programação.\n\nDigite **"bora"** para começar uma aula ou me faça uma pergunta!`
  }
}
