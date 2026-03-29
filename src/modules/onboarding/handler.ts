// Handler de Onboarding — 4 steps para coletar perfil do aluno
// Usa Claude Sonnet para gerar respostas naturais (não hardcoded)

import { claude } from '../../services/claude.js'
import { logger } from '../../utils/logger.js'
import { updateUserProfile } from '../../db/queries/users.js'
import { setState } from '../../db/queries/conversation-state.js'
import type { User } from '../../db/schema.js'

export interface OnboardingResult {
  responseText: string
  nextStep: number | null // null = onboarding completo
  userData: Partial<User>
}

const ONBOARDING_SYSTEM_PROMPT = `Você é o Koda, professor de programação amigável que ensina via WhatsApp.
Você está fazendo o onboarding de um aluno novo. Mensagens curtas, tom amigável, emojis moderados.
Responda APENAS com JSON: {"response_text": "...", "extracted_data": {...}}

Regras:
- Se mensagem não corresponde à pergunta, redirecione gentilmente
- Seja flexível: "quero criar um app" → goal=create_saas
- NUNCA diga "sou IA" ou "sou bot"
- Português brasileiro casual`

function buildStepPrompt(step: number, message: string, userName?: string): string {
  switch (step) {
    case 0:
      return `Step 0: Aluno mandou primeira mensagem: "${message}"
Apresente-se como Koda, mencione XP, pergunte o nome. Max 3 frases.
extracted_data: {} (nada a extrair nesse step)`

    case 1:
      return `Step 1: Aluno disse o nome/respondeu: "${message}"
Extraia o nome, use-o na resposta, pergunte objetivo com opções: "Aprender do zero", "Mudar de carreira", "Criar meu app/SaaS".
extracted_data: { "name": "nome extraído" }`

    case 2:
      return `Step 2: Aluno disse objetivo: "${message}". Nome: ${userName || 'desconhecido'}
Mapeie: aprender/zero→zero_to_dev, carreira→career_change, app/saas/criar→create_saas
Pergunte nível: "Nunca programei", "Sei um pouco de HTML", "Já sei JavaScript"
extracted_data: { "goal": "zero_to_dev|career_change|create_saas" }`

    case 3:
      return `Step 3: Aluno disse nível: "${message}". Nome: ${userName || 'desconhecido'}
Mapeie: nunca/zero→beginner, html/pouco→basic_html, javascript/js→knows_js
Pergunte disponibilidade: "5-10 min/dia", "15-30 min/dia", "30+ min/dia"
extracted_data: { "level": "beginner|basic_html|knows_js" }`

    case 4:
      return `Step 4: Aluno disse disponibilidade: "${message}". Nome: ${userName || 'desconhecido'}
Mapeie: 5-10→10, 15-30→20, 30+→45
Faça resumo do perfil e convide para primeira aula: "Manda 'bora' quando quiser começar! 🚀"
extracted_data: { "availability_minutes": 10|20|45 }`

    default:
      return `Step desconhecido. Redirecione para o HUB.`
  }
}

export async function handleOnboarding(
  user: User,
  message: string,
  step: number,
): Promise<OnboardingResult> {
  try {
    const prompt = buildStepPrompt(step, message, user.name ?? undefined)

    const response = await claude.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: ONBOARDING_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      logger.warn('Onboarding: resposta sem JSON', { step, text })
      return {
        responseText: getDefaultResponse(step),
        nextStep: step,
        userData: {},
      }
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      response_text: string
      extracted_data: Record<string, unknown>
    }

    // Mapear dados extraídos para campos do User
    const userData: Partial<User> = {}
    const data = parsed.extracted_data || {}

    if (step === 1 && data.name) {
      userData.name = String(data.name)
    }
    if (step === 2 && data.goal) {
      userData.objective = String(data.goal)
    }
    if (step === 3 && data.level) {
      userData.level = String(data.level) as User['level']
    }
    if (step === 4 && data.availability_minutes) {
      userData.daily_availability = Number(data.availability_minutes)
    }

    // Salvar dados coletados no Supabase
    if (Object.keys(userData).length > 0) {
      await updateUserProfile(user.id, userData)
    }

    // Determinar próximo step
    let nextStep: number | null = step + 1
    if (step >= 4) {
      nextStep = null
      // AC8: Marcar onboarding como completo
      await updateUserProfile(user.id, { onboarding_completed: true })
      // AC9: Transicionar para HUB
      await setState(user.id, 'HUB', { onboardingCompleted: true })
    } else {
      // AC14: Atualizar context com step atual
      await setState(user.id, 'ONBOARDING', { onboarding_step: nextStep })
    }

    return {
      responseText: parsed.response_text,
      nextStep,
      userData,
    }
  } catch (error) {
    logger.error('Erro no onboarding', {
      userId: user.id,
      step,
      error: error instanceof Error ? error.message : String(error),
    })

    return {
      responseText: getDefaultResponse(step),
      nextStep: step, // Fica no mesmo step para retry
      userData: {},
    }
  }
}

function getDefaultResponse(step: number): string {
  const defaults: Record<number, string> = {
    0: 'Oi! 👋 Sou o Koda, seu professor de programação! Qual é o seu nome?',
    1: 'Legal! Me conta, o que te traz aqui? Quer aprender do zero, mudar de carreira ou criar seu app?',
    2: 'Boa! Qual seu nível atual? Nunca programou, sabe um pouco de HTML ou já conhece JavaScript?',
    3: 'Quanto tempo por dia você consegue dedicar? 5-10 min, 15-30 min ou 30+ min?',
    4: 'Show! Tudo pronto! 🎉 Manda um "bora" quando quiser começar a primeira aula!',
  }
  return defaults[step] ?? 'Hmm, me perdi aqui. Manda um "oi" pra gente recomeçar? 😅'
}
