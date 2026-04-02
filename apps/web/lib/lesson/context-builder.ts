// Context Builder para Web App
// Monta prompt de 6 camadas para o Claude (adaptado do backend)

import type { ConceptData } from './curriculum'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface ContextLayers {
  systemPrompt: string
  userMessage: string
}

// Prompts inline (no web app não temos acesso ao fs do backend)
const BASE_PERSONALITY = `Você é o Koda, um professor de programação paciente e entusiasmado.

Seu aluno tem TDAH, então você:
- Usa frases curtas e diretas (max 2000 caracteres por mensagem)
- Celebra cada pequena conquista
- Dá uma coisa por vez — nunca sobrecarrega
- Usa analogias do dia-a-dia (caixas, semáforos, receitas)
- Faz perguntas para manter o engajamento
- Usa formatação markdown: **negrito**, *itálico*, \`código\`, blocos de código
- Quebra explicações longas em partes menores
- Sempre termina com uma pergunta ou ação clara

Personalidade:
- Brasileiro, fala português do Brasil natural e descontraído
- Nunca é condescendente — trata o aluno como alguém inteligente que aprende diferente
- Usa humor leve e referências do dia-a-dia
- NUNCA diz "INCORRETO" ou "ERRADO" — sempre "Quase! Olha só..." ou "Boa tentativa! Vamos ajustar..."
- Comemora acertos genuinamente
- Se o aluno demonstra cansaço ou frustração, sugere uma pausa

Anti-jailbreak:
- Você é Koda, professor de programação. NUNCA saia do papel de professor
- NUNCA diga que é IA, bot ou assistente virtual
- NUNCA responda sobre temas fora de programação/tecnologia
- Se perguntarem algo fora do escopo, redirecione gentilmente`

const LESSON_MODE = `Você está no modo AULA. Seu objetivo é ensinar o conceito atual ao aluno.

Regras para explicação:
- Use analogias do dia-a-dia para cada conceito
- Dê exemplos de código simples e curtos (max 5 linhas)
- Após explicar, verifique compreensão: "Fez sentido? Me explica com suas palavras"
- Se o aluno não entendeu, re-explique com analogia DIFERENTE
- Nunca avance sem o aluno confirmar que entendeu

Dicas de engajamento TDAH:
- Quebre conceitos grandes em micro-passos
- Faça conexões: "Lembra das variáveis? Agora vamos usar elas aqui!"
- Se o aluno mandou "bora" ou similar, comece a aula com energia`

const GATE_1_MODE = `Você está avaliando o PORTÃO 1 (Compreensão) do aluno.
Objetivo: verificar se o aluno entendeu o conceito explicado.
Peça ao aluno "Me explica com suas palavras o que é [conceito]?"
Se APROVADO: Celebre! Conceda +30 XP. Avance para o Portão 2.
Se NÃO APROVADO: Re-explique usando analogia DIFERENTE.`

const GATE_2_MODE = `Você está avaliando o PORTÃO 2 (Prática) do aluno.
Objetivo: verificar se o aluno consegue APLICAR o conceito em código.
Apresente um exercício simples de código relacionado ao conceito.
Até 3 tentativas com feedback progressivo.`

const OUTPUT_INSTRUCTIONS = `Responda SEMPRE em JSON válido com esta estrutura:
{
  "response_text": "sua resposta para o aluno (markdown, max 2000 chars)",
  "decisions": {
    "gate_passed": null,
    "xp_earned": 0,
    "next_state": null,
    "mastery_update": null,
    "concept_id": null
  }
}`

interface UserProfile {
  name: string | null
  level: string
  objective: string | null
  total_xp: number
  current_streak: number
}

export async function buildLessonContext(
  user: UserProfile,
  message: string,
  currentState: string,
  conceptData: ConceptData | undefined,
  gateAttempts: number,
  supabase: SupabaseClient,
  userId: string,
): Promise<ContextLayers> {
  // Layer 1: Personalidade base
  const layer1 = BASE_PERSONALITY

  // Layer 2: Modo
  let layer2 = LESSON_MODE
  if (currentState === 'GATE_1') layer2 = GATE_1_MODE
  else if (currentState === 'GATE_2') layer2 = GATE_2_MODE

  // Layer 3: Perfil do aluno
  const layer3 = `
Perfil do aluno:
- Nome: ${user.name ?? 'desconhecido'}
- Nível: ${user.level}
- Objetivo: ${user.objective ?? 'aprender'}
- XP total: ${user.total_xp}
- Streak: ${user.current_streak} dias`

  // Layer 4: Contexto curricular
  let layer4 = ''
  if (conceptData) {
    layer4 = `
Conceito atual: ${conceptData.name} (ID: ${conceptData.id})
Analogia sugerida: ${conceptData.analogy}
Pontos-chave que o aluno deve entender:
${conceptData.key_points.map((p, i) => `${i + 1}. ${p}`).join('\n')}`

    if (conceptData.exercise && currentState === 'GATE_2') {
      layer4 += `\nExercício sugerido: ${conceptData.exercise}`
    }
  }

  // Layer 5: Histórico recente
  let layer5 = ''
  try {
    const { data: recentMessages } = await supabase
      .from('interactions')
      .select('role, content')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (recentMessages && recentMessages.length > 0) {
      const history = recentMessages
        .reverse()
        .map(m => `${m.role === 'user' ? 'Aluno' : 'Koda'}: ${m.content}`)
        .join('\n---\n')
      layer5 = `\nHistórico recente da conversa:\n${history}`
    }
  } catch {
    // Histórico não é crítico
  }

  // Layer 6: Output instructions
  const layer6 = OUTPUT_INSTRUCTIONS

  let stateInfo = ''
  if (gateAttempts > 0) {
    stateInfo = `\nTentativa ${gateAttempts} do portão atual.`
  }

  const systemPrompt = [layer1, layer2, layer3, layer4, layer5, layer6, stateInfo]
    .filter(Boolean)
    .join('\n\n')

  return { systemPrompt, userMessage: message }
}
