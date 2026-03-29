// Context Builder — monta prompt de 6 camadas para o Claude
// Layer 1: Personalidade base (prompts/base-personality.md)
// Layer 2: Modo (lesson, gate-1, gate-2)
// Layer 3: Perfil do aluno
// Layer 4: Contexto curricular
// Layer 5: Histórico recente (últimas 10 mensagens)
// Layer 6: Output instructions

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { supabase } from '../services/supabase.js'
import type { User, ConversationState } from '../db/schema.js'

export interface ContextLayers {
  systemPrompt: string
  userMessage: string
}

// Cache de prompts em memória (carregados uma vez)
const promptCache = new Map<string, string>()

function loadPrompt(filename: string): string {
  if (promptCache.has(filename)) {
    return promptCache.get(filename)!
  }
  const filePath = join(process.cwd(), 'prompts', filename)
  const content = readFileSync(filePath, 'utf-8')
  promptCache.set(filename, content)
  return content
}

export async function buildLessonContext(
  user: User,
  message: string,
  state: ConversationState,
  conceptData?: { id: string; name: string; analogy: string; key_points: string[]; exercise?: string },
): Promise<ContextLayers> {
  // Layer 1: Personalidade base
  const layer1 = loadPrompt('base-personality.md')

  // Layer 2: Modo (baseado no estado)
  let layer2 = ''
  const currentState = state.current_state
  if (currentState === 'GATE_1') {
    layer2 = loadPrompt('gate-1-comprehension.md')
  } else if (currentState === 'GATE_2') {
    layer2 = loadPrompt('gate-2-practice.md')
  } else {
    layer2 = loadPrompt('lesson.md')
  }

  // Layer 3: Perfil do aluno
  const layer3 = `
Perfil do aluno:
- Nome: ${user.name ?? 'desconhecido'}
- Nível: ${user.level}
- Objetivo: ${user.objective ?? 'aprender'}
- XP total: ${user.total_xp}
- Streak: ${user.current_streak} dias
- Humor: ${user.mood ?? 'neutro'}`

  // Layer 4: Contexto curricular
  let layer4 = ''
  if (conceptData) {
    layer4 = `
Conceito atual: ${conceptData.name} (ID: ${conceptData.id})
Analogia sugerida: ${conceptData.analogy}
Pontos-chave que o aluno deve entender:
${conceptData.key_points.map((p, i) => `${i + 1}. ${p}`).join('\n')}`

    if (conceptData.exercise && (currentState === 'GATE_2')) {
      layer4 += `\nExercício sugerido: ${conceptData.exercise}`
    }
  }

  // Layer 5: Histórico recente (últimas 10 interações)
  let layer5 = ''
  try {
    const { data: recentMessages } = await supabase
      .from('interactions')
      .select('user_message, bot_response')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (recentMessages && recentMessages.length > 0) {
      const history = recentMessages
        .reverse()
        .map(m => `Aluno: ${m.user_message}\nKoda: ${m.bot_response}`)
        .join('\n---\n')
      layer5 = `\nHistórico recente da conversa:\n${history}`
    }
  } catch {
    // Histórico não é crítico — segue sem ele
  }

  // Layer 6: Output instructions
  const layer6 = loadPrompt('output-instructions.md')

  // Contexto do state (gate attempts, etc)
  const stateContext = state.context as Record<string, unknown>
  let stateInfo = ''
  if (stateContext.gateAttempts) {
    stateInfo = `\nTentativa ${stateContext.gateAttempts} do portão atual.`
  }

  const systemPrompt = [layer1, layer2, layer3, layer4, layer5, layer6, stateInfo]
    .filter(Boolean)
    .join('\n\n')

  return { systemPrompt, userMessage: message }
}
