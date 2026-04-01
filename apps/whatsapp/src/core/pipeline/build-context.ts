// Etapa 6 — Build Context
// Monta prompt em camadas para o Claude
// MVP: Layer 1 (personalidade base) + Layer 6 (output instructions)
// Layers 2-5 serão expandidas em stories posteriores

import type { User } from '../../db/schema.js'
import type { IntentResult } from './classify-intent.js'
import type { TransitionResult } from './state-transition.js'

export interface ContextResult {
  systemPrompt: string
  userMessage: string
}

const BASE_PERSONALITY = `Você é o Koda, um professor de programação paciente e entusiasmado que ensina via WhatsApp.

Seu aluno tem TDAH, então você:
- Usa frases curtas e diretas
- Celebra cada pequena conquista com emojis 🎉
- Dá uma coisa por vez — nunca sobrecarrega
- Usa analogias do dia-a-dia
- Faz perguntas para manter o engajamento
- Usa formatação WhatsApp: *negrito*, _itálico_, \`código\`, \`\`\`blocos\`\`\`
- Quebra explicações longas em partes menores
- Sempre termina com uma pergunta ou ação clara

Você é brasileiro e fala português do Brasil de forma natural e descontraída.
Nunca é condescendente — trata o aluno como alguém inteligente que aprende diferente.`

const OUTPUT_INSTRUCTIONS = `Responda SEMPRE em JSON válido com esta estrutura:
{
  "response_text": "sua resposta para o aluno (formatação WhatsApp)",
  "decisions": {
    "gate_passed": false,
    "xp_earned": 0,
    "next_state": null,
    "mastery_update": null
  }
}

Regras do JSON:
- response_text: a mensagem que será enviada ao aluno no WhatsApp
- gate_passed: true se o aluno passou um portão de avaliação nesta interação
- xp_earned: XP ganho (0, 5, 10, 15, 25, 50 dependendo da ação)
- next_state: sugestão de próximo estado (null se manter atual)
- mastery_update: null ou objeto com atualização de progresso`

export async function buildContext(
  user: User,
  text: string,
  intent: IntentResult,
  transition: TransitionResult,
): Promise<ContextResult> {
  // Layer 1: Personalidade base
  let systemPrompt = BASE_PERSONALITY

  // Layer 2: Modo (baseado no estado da conversa) — será expandido
  systemPrompt += `\n\nEstado atual: ${transition.newState}`
  systemPrompt += `\nAção: ${transition.action}`

  // Layer 3: Perfil do aluno
  systemPrompt += `\n\nPerfil do aluno:`
  systemPrompt += `\n- Nome: ${user.name ?? 'ainda não informado'}`
  systemPrompt += `\n- Nível: ${user.level}`
  systemPrompt += `\n- XP total: ${user.total_xp}`
  systemPrompt += `\n- Streak: ${user.current_streak} dias`
  systemPrompt += `\n- Onboarding: ${user.onboarding_completed ? 'completo' : 'pendente'}`
  if (user.mood) {
    systemPrompt += `\n- Humor: ${user.mood}`
  }

  // Layer 4: Currículo — será expandido na Story 1.8
  // Layer 5: Histórico — será expandido

  // Layer 6: Output instructions
  systemPrompt += `\n\n${OUTPUT_INSTRUCTIONS}`

  // Intent classificado (para contexto do Claude)
  const userMessage = `[intent: ${intent.intent}, confidence: ${intent.confidence}]\n\nMensagem do aluno: ${text}`

  return { systemPrompt, userMessage }
}
