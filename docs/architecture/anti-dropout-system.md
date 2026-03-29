# Koda — Sistema Anti-Abandono (TDAH-Proof)

**Versao:** 1.0
**Data:** 29 de marco de 2026
**Autor:** Aria (@architect)
**Status:** Draft

---

## O Problema Real

> "TDAH tem mania de comecar e nao terminar"

Cursos tradicionais tem **70%+ de desistencia**. Para cerebros TDAH, e pior:
- Novidade inicial gera hiperfoco → comeca animado
- Rotina se instala → dopamina cai → abandona
- Culpa por abandonar → nao volta mais

**Koda precisa quebrar esse ciclo em TODAS as camadas do sistema.**

---

## Principio Arquitetural

```
NAO E O ALUNO QUE PRECISA TER DISCIPLINA.
E O SISTEMA QUE PRECISA SER IMPOSSIVEL DE ABANDONAR.
```

Isso significa que anti-abandono nao e uma feature — e uma **propriedade do sistema inteiro**.
Cada componente do Koda tem um papel na retencao.

---

## 7 Mecanismos Anti-Abandono

### 1. MICRO-COMPLETUDE (Nunca sair sem vitoria)

**Problema:** Aluno para no meio → sente que nao fez nada → culpa → nao volta.

**Solucao:** Toda interacao, por menor que seja, gera uma **micro-vitoria registrada**.

```
Abriu o Koda hoje?                     → +5 XP "Presente!"
Respondeu 1 pergunta?                  → +10 XP "Aquecimento feito"
Fez 1 quiz?                           → +20 XP "Quiz Master"
Completou um conceito?                 → +50 XP "Conceito dominado!"
Explicou com suas palavras?            → +30 XP "Professor por um dia"
Disse "cansei" ao inves de sumir?      → +15 XP "Honestidade e XP tambem"
```

**Regra arquitetural:**
- O sistema NUNCA termina uma sessao sem dar XP
- Ate "cansei" gera recompensa (reforco positivo por ser honesto)
- Mensagem final sempre mostra: "Hoje voce ganhou X XP. Total: Y. Voce esta no nivel Z."

**Implementacao:**

```typescript
// src/modules/gamification/micro-completion.ts
interface SessionSummary {
  xp_earned: number
  actions_completed: string[]
  streak_status: 'maintained' | 'started' | 'broken_but_forgiven'
  motivational_message: string
}

// TODA sessao, mesmo de 30 segundos, gera um summary
function generateSessionSummary(session: Session): SessionSummary {
  const xp = calculateMinimumXP(session) // MINIMO 5 XP
  return {
    xp_earned: Math.max(5, xp), // NUNCA zero
    actions_completed: getCompletedActions(session),
    streak_status: getStreakStatus(session),
    motivational_message: pickMotivationalMessage(xp, session.duration)
  }
}
```

---

### 2. FORMATO NUNCA REPETE (Anti-monotonia algoritmico)

**Problema:** TDAH enjoa de padrao. Se toda aula e "explicacao → pergunta → exercicio", morre na semana 2.

**Solucao:** **Algoritmo de rotacao de formato** que GARANTE variacao.

```
Formatos disponiveis (8 tipos):
┌─────────────────────────────────────────────┐
│ 🎯 Quiz relampago (30s por pergunta)        │
│ 💻 Desafio de codigo (escreve e submete)    │
│ 🎮 Ache o bug (puzzle de debugging)         │
│ 🧩 Ordene as linhas (quebra-cabeca logico)  │
│ 🏆 Boss fight (junta 3+ conceitos)          │
│ 🎲 Revisao aleatoria (conceito surpresa)    │
│ 📸 "O que esse codigo faz?" (leitura)       │
│ 🔥 Speed coding (resolva em 2 min)          │
└─────────────────────────────────────────────┘
```

**Algoritmo de rotacao:**

```typescript
// src/core/format-rotator.ts

interface FormatHistory {
  last_3_formats: FormatType[]  // ultimos 3 formatos usados
  format_counts: Record<FormatType, number>  // contagem total
  student_preferences: Record<FormatType, number>  // rating 1-5
}

function pickNextFormat(
  history: FormatHistory,
  mood: MoodType,
  concept: Concept
): FormatType {
  const available = ALL_FORMATS.filter(f => {
    // REGRA 1: Nunca repetir os ultimos 2
    if (history.last_3_formats.slice(0, 2).includes(f)) return false

    // REGRA 2: Formato compativel com o conceito
    if (!isCompatible(f, concept)) return false

    return true
  })

  // REGRA 3: Adaptar ao humor
  const weighted = available.map(f => ({
    format: f,
    weight: calculateWeight(f, mood, history)
  }))

  // mood "focado" → mais desafio de codigo, boss fight
  // mood "de boa" → mais quiz, leitura
  // mood "quero jogar" → mais ache-o-bug, speed coding, ordene
  // mood "cansei" → quiz curto ou revisao leve

  // REGRA 4: Surpresa controlada (20% chance de formato aleatorio)
  if (Math.random() < 0.2) {
    return pickRandom(available)
  }

  return pickWeighted(weighted)
}
```

**Regra arquitetural:**
- O sistema RASTREIA os ultimos 10 formatos usados por aluno
- NUNCA usa o mesmo formato 2x seguidas
- A cada 5 sessoes, introduz um formato que o aluno ainda nao experimentou
- "Surpresa" aparece 20% das vezes (dopamina de novidade)

---

### 3. RE-ENGAJAMENTO PROATIVO (O Koda vem ate voce)

**Problema:** Aluno para de estudar. Ninguem chama. Esquece. Fim.

**Solucao:** Sistema de re-engajamento em cascata com escalamento progressivo.

```
Dia 0: Aluno estuda normalmente
Dia 1 sem estudar: Nada (normal)
Dia 2 sem estudar: Mensagem leve
  "Oi! Senti sua falta. Um quiz de 30 segundos pra manter o ritmo? 🎯"

Dia 3 sem estudar: Apelo a perda
  "Seu streak de 5 dias ta em risco! 30 segundos salvam ele 🔥"

Dia 5 sem estudar: Curiosidade
  "Sabia que voce esta a 2 conceitos de desbloquear a Ilha JavaScript? 🏝️"

Dia 7 sem estudar: Desafio direto
  "Te mando UM ache-o-bug. Se acertar, ganho nao ganho nada. Se errar... 😏"

Dia 14 sem estudar: Empatia
  "Tudo bem sumir. A vida acontece. Quando quiser voltar, estou aqui.
   Seu progresso ta salvo: 🟢 12 conceitos dominados. Nao perde nada."

Dia 30 sem estudar: Ultimo toque
  "Faz 1 mes! Mudou muito desde sua ultima vez:
   ✨ Adicionei 3 formatos novos de exercicio
   🎮 Tem um boss fight te esperando
   Quando quiser, e so mandar um 'oi'"

Depois: Silencio. Nao incomoda mais.
         Se voltar, recebe: "Que bom te ver! Vamos do seu jeito."
```

**Implementacao:**

```typescript
// src/modules/reengagement/scheduler.ts

interface ReengagementRule {
  days_inactive: number
  message_type: 'light' | 'loss_aversion' | 'curiosity' | 'challenge' | 'empathy' | 'final'
  template: string
  send_time: 'morning' | 'evening' | 'student_preferred'
}

const REENGAGEMENT_CASCADE: ReengagementRule[] = [
  { days_inactive: 2, message_type: 'light', template: 'quiz_invite', send_time: 'student_preferred' },
  { days_inactive: 3, message_type: 'loss_aversion', template: 'streak_risk', send_time: 'evening' },
  { days_inactive: 5, message_type: 'curiosity', template: 'progress_tease', send_time: 'morning' },
  { days_inactive: 7, message_type: 'challenge', template: 'direct_challenge', send_time: 'evening' },
  { days_inactive: 14, message_type: 'empathy', template: 'no_pressure', send_time: 'morning' },
  { days_inactive: 30, message_type: 'final', template: 'whats_new', send_time: 'morning' },
]

// REGRAS:
// - NUNCA mais de 1 mensagem por dia
// - NUNCA em horario inconveniente (respeitar timezone + preferencia)
// - NUNCA culpar ("Voce nao estudou!")
// - SEMPRE oferecer algo FACIL para voltar (quiz 30s, nao aula de 30min)
// - Parar apos 30 dias (respeitar decisao do aluno)
```

**Regra arquitetural:**
- Cron job diario verifica usuarios inativos
- Mensagens sao enviadas via Evolution API (mesmo canal do ensino)
- Aluno pode desativar notificacoes a qualquer momento
- Cada mensagem de re-engajamento e um **convite leve**, nunca cobranca

---

### 4. ZERO CULPA (Re-entry sem fricção)

**Problema:** Aluno sumiu 2 semanas. Sente vergonha. Nao volta.

**Solucao:** O sistema COMEMORA quando o aluno volta. NUNCA pune.

```
Aluno volta apos 3 dias:
  "Oi! Que bom te ver. Seu progresso ta todo aqui.
   Vamos fazer um aquecimento rapido? (30 segundos)"

Aluno volta apos 2 semanas:
  "Hey! Bem-vindo de volta 🎉
   Muita coisa aconteceu — voce ja domina 8 conceitos!
   Que tal revisar os 2 ultimos antes de avancar?
   (Quiz relampago, 1 minuto)"

Aluno volta apos 2 meses:
  "Uau, faz tempo! Tudo bem, a vida acontece.
   Seu progresso ta intacto: 🟢 15 conceitos dominados.
   Vamos recomecar de leve? Escolhe:
   1️⃣ Revisao rapida do que voce ja sabe
   2️⃣ Continuar de onde parou
   3️⃣ Comeca do zero (sem perder badges)"
```

**Implementacao:**

```typescript
// src/modules/reentry/handler.ts

function handleReentry(user: User, daysSinceLastActivity: number) {
  // NUNCA mencionar quanto tempo ficou fora de forma negativa
  // SEMPRE mostrar o que JA CONQUISTOU
  // SEMPRE oferecer opcoes (autonomia = engajamento TDAH)

  if (daysSinceLastActivity <= 3) {
    return quickWarmup(user)  // Quiz de 30s dos ultimos conceitos
  }

  if (daysSinceLastActivity <= 14) {
    return gentleReview(user)  // Revisao de 2 conceitos + opcao de avancar
  }

  // Mais de 14 dias: dar opcoes
  return fullReentryMenu(user)

  // REGRAS CRITICAS:
  // - Streak quebrado? NAO MENCIONAR a quebra
  //   Em vez disso: "Vamos comecar um novo streak hoje! 🔥"
  // - Progresso NUNCA e perdido
  // - Badges NUNCA sao removidos
  // - XP NUNCA diminui
}
```

**Regra arquitetural:**
- NENHUM dado e deletado por inatividade
- Streaks quebrados nao sao mencionados negativamente
- Novo streak comeca imediatamente quando volta
- "Streak de volta" bonus: +20 XP extra por voltar

---

### 5. DIFICULDADE ADAPTATIVA (Nunca frustra, nunca entedia)

**Problema TDAH:** Muito facil = entedia → abandona. Muito dificil = frustra → abandona.

**Solucao:** Sistema de dificuldade dinamica baseado em performance recente.

```
┌─────────────────────────────────────────────────┐
│              ZONA DE FLOW                        │
│                                                   │
│  Ansiedade   ┌─────────────────┐                 │
│     ▲        │                 │                 │
│     │   HARD │   🎯 FLOW      │                 │
│     │        │   (objetivo)   │                 │
│     │        │                 │                 │
│     │        └─────────────────┘                 │
│     │   EASY                         Tedio       │
│     └──────────────────────────────────▶         │
│              Habilidade                           │
└─────────────────────────────────────────────────┘
```

**Sinais de dificuldade errada:**

```
MUITO FACIL (sinais):
- Responde correto < 10 segundos
- 5 acertos seguidos sem erro
- Respostas curtas e desinteressadas
→ ACAO: Aumentar dificuldade, oferecer boss fight

MUITO DIFICIL (sinais):
- 3 erros seguidos no mesmo conceito
- Tempo de resposta > 5 minutos (desistiu?)
- Mensagens frustradas ("nao consigo", "nao entendo")
→ ACAO: Baixar dificuldade, mudar abordagem, oferecer formato diferente

NO FLOW (sinais):
- Respostas em 30s-3min
- Mix de acertos e erros
- Mensagens engajadas
→ ACAO: Manter ritmo, nao interferir
```

**Implementacao:**

```typescript
// src/core/difficulty-adapter.ts

interface DifficultySignals {
  recent_accuracy: number         // % acertos ultimos 10 exercicios
  avg_response_time_ms: number    // tempo medio de resposta
  consecutive_correct: number     // acertos seguidos
  consecutive_wrong: number       // erros seguidos
  frustration_signals: number     // msgs com "nao entendo", "dificil"
  boredom_signals: number         // respostas monossilabicas, rapidas demais
}

type DifficultyAction =
  | 'maintain'           // zona de flow, nao mexer
  | 'increase'           // muito facil, desafiar mais
  | 'decrease'           // muito dificil, simplificar
  | 'change_approach'    // mesmo nivel, formato diferente
  | 'offer_break'        // frustrado, sugerir pausa
  | 'offer_boss_fight'   // entediado, desafio grande

function adaptDifficulty(signals: DifficultySignals): DifficultyAction {
  if (signals.consecutive_wrong >= 3) return 'change_approach'
  if (signals.frustration_signals >= 2) return 'offer_break'
  if (signals.consecutive_correct >= 5 && signals.avg_response_time_ms < 10000) return 'increase'
  if (signals.boredom_signals >= 3) return 'offer_boss_fight'
  if (signals.recent_accuracy > 0.7 && signals.recent_accuracy < 0.9) return 'maintain'
  return 'maintain'
}
```

**Regra arquitetural:**
- O sistema avalia dificuldade a CADA interacao (nao a cada aula)
- Mudancas de abordagem sao TRANSPARENTES ("Vou explicar de outro jeito")
- NUNCA diz "Isso e muito avancado para voce" — SEMPRE adapta silenciosamente
- Se muda de abordagem 3x e aluno nao entende → pula para proximo conceito
  com nota: "Vamos voltar nisso depois. Voce vai entender melhor apos ver X"

---

### 6. PROGRESSO SEMPRE VISIVEL (Dopamina visual)

**Problema TDAH:** Sem feedback visual constante, esquece que esta progredindo.

**Solucao:** Progresso e mostrado PROATIVAMENTE, nao so quando aluno pede.

```
Apos CADA conceito dominado:
  "🟢 Variáveis dominadas!
   Progresso no modulo JavaScript: ████████░░ 80%
   Faltam 2 conceitos para desbloquear a Ilha TypeScript! 🏰"

Apos CADA sessao:
  "Sessao de hoje: 12 minutos ⏱️
   +120 XP ganhos ⚡
   Streak: 🔥🔥🔥🔥🔥 5 dias!
   Proximo milestone: Badge 'Ilha Completa' (faltam 3 conceitos)"

Semanal (segunda de manha):
  "📊 Sua semana:
   ⭐ 4 conceitos dominados
   ⚡ 380 XP ganhos
   🔥 Streak: 7 dias (novo recorde!)
   📈 Voce esta no top 15% dos alunos do Koda
   🏝️ Proximo: Ilha CSS (desbloqueia amanha se continuar!)"
```

**Implementacao:**

```typescript
// src/modules/gamification/progress-display.ts

// Mostrar progresso em 3 momentos:
// 1. Apos cada micro-vitoria (inline na conversa)
// 2. Ao final de cada sessao (summary)
// 3. Semanalmente (relatorio motivacional)

function generateProgressBar(current: number, total: number): string {
  const filled = Math.round((current / total) * 10)
  const empty = 10 - filled
  return '█'.repeat(filled) + '░'.repeat(empty) + ` ${Math.round((current/total)*100)}%`
}

function generateSessionEnd(session: SessionSummary): string {
  return [
    `⏱️ ${session.duration_minutes} minutos estudados`,
    `⚡ +${session.xp_earned} XP`,
    `🔥 Streak: ${session.streak_count} dias`,
    session.badge_earned ? `🏆 Nova badge: ${session.badge_earned}!` : null,
    `📍 Proximo: ${session.next_milestone}`,
  ].filter(Boolean).join('\n')
}
```

---

### 7. COMPROMISSO MINIMO RIDICULO (A regra dos 30 segundos)

**Problema TDAH:** "Estudar 30 min" parece impossivel num dia ruim. Entao nao faz nada.

**Solucao:** O compromisso minimo e **30 SEGUNDOS**. Nao 5 minutos. 30 segundos.

```
Quando aluno diz "cansei" ou "nao to afim":
  "Tudo bem! Que tal so 30 segundos?
   Um quiz de UMA pergunta. Se acertar, ganho XP. Se errar, ganho XP tambem.
   Topa? (sim / nao)"

Se sim → Quiz de 1 pergunta → +15 XP → "Pronto! Streak mantido 🔥"
Se nao → "Sem problema! Te vejo amanha. Streak salvo por hoje ✨"
```

**Regra arquitetural:**
- TODA sessao pode durar 30 segundos e ainda contar
- "Streak protection" — 1 quiz de 30s mantem o streak
- O sistema NUNCA exige sessao minima > 30 segundos
- Formatos de 30s disponiveis: quiz 1 pergunta, "o que esse codigo faz?", verdadeiro/falso
- Se aluno faz APENAS o quiz de 30s por 3 dias seguidos, sistema pergunta:
  "Hey, notei que voce ta fazendo so quizzes rapidos. Tudo bem!
   Quando tiver 3 minutos, tem um desafio legal te esperando.
   Sem pressa 😊"

**Por que funciona:**
- Reduz a barreira de entrada para ZERO
- Uma vez que comecou, 60% das vezes o aluno continua alem dos 30s
- Mantem o habito mesmo em dias ruins
- NUNCA quebra o streak por "nao ter tempo"

---

## Tabela de Estado: Anti-Dropout no Banco

```sql
-- Adicionar a tabela users:
ALTER TABLE users ADD COLUMN
  preferred_study_time time,        -- horario preferido
  notification_enabled boolean DEFAULT true,
  last_activity_at timestamptz,
  total_sessions int DEFAULT 0,
  avg_session_duration_seconds int DEFAULT 0,
  dropout_risk_score float DEFAULT 0;  -- 0.0 (engajado) a 1.0 (risco alto)

-- Nova tabela: reengagement_log
CREATE TABLE reengagement_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  days_inactive int NOT NULL,
  message_type text NOT NULL,
  message_sent text NOT NULL,
  student_responded boolean DEFAULT false,
  responded_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Nova tabela: difficulty_signals
CREATE TABLE difficulty_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  session_id uuid REFERENCES sessions(id),
  recent_accuracy float,
  avg_response_time_ms int,
  consecutive_correct int DEFAULT 0,
  consecutive_wrong int DEFAULT 0,
  frustration_detected boolean DEFAULT false,
  boredom_detected boolean DEFAULT false,
  difficulty_action text,  -- maintain, increase, decrease, etc
  created_at timestamptz DEFAULT now()
);
```

---

## Dropout Risk Score (Modelo Preditivo)

```typescript
// src/modules/reengagement/risk-scorer.ts

function calculateDropoutRisk(user: User, history: UserHistory): number {
  let risk = 0

  // Fator 1: Dias sem atividade (peso alto)
  const daysSinceActive = daysSince(user.last_activity_at)
  if (daysSinceActive >= 7) risk += 0.3
  else if (daysSinceActive >= 3) risk += 0.15
  else if (daysSinceActive >= 2) risk += 0.05

  // Fator 2: Tendencia de sessoes (encurtando?)
  const sessionTrend = calculateSessionDurationTrend(history.last_10_sessions)
  if (sessionTrend === 'decreasing') risk += 0.2

  // Fator 3: Streak quebrado recentemente
  if (history.streak_broken_recently) risk += 0.1

  // Fator 4: Taxa de acerto caindo (frustração)
  const accuracyTrend = calculateAccuracyTrend(history.last_20_exercises)
  if (accuracyTrend === 'decreasing') risk += 0.15

  // Fator 5: Formatos se repetindo (monotonia)
  const formatVariety = calculateFormatVariety(history.last_10_sessions)
  if (formatVariety < 0.3) risk += 0.1

  // Fator 6: Nunca passou do modulo 2 (padrao classico de abandono)
  if (user.total_sessions > 20 && history.max_module_reached <= 2) risk += 0.15

  // Fator positivo: badges recentes reduzem risco
  if (history.badge_earned_last_7_days) risk -= 0.1

  // Fator positivo: streak longo reduz risco
  if (history.current_streak >= 7) risk -= 0.15

  return Math.max(0, Math.min(1, risk))
}

// Rodar diariamente para TODOS os usuarios
// Se risk > 0.5 → acionar re-engajamento proativo
// Se risk > 0.8 → alerta para admin dashboard
```

---

## Integracao com Arquitetura Existente

Estes mecanismos se integram ao pipeline de mensagem:

```
MENSAGEM CHEGA
     │
     ▼
[... classificacao, state machine, context ...]
     │
     ▼
┌─────────────────────────────┐
│ CONTEXT BUILDER (Layer 3)   │
│ Adicionar ao prompt:        │
│ - Dias desde ultima sessao  │
│ - Dropout risk score        │
│ - Humor detectado           │
│ - Formato a usar (rotator)  │
│ - Dificuldade adaptada      │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ POST-PROCESS                │
│ Adicionar apos resposta:    │
│ - Micro-completion XP       │
│ - Progress bar              │
│ - Session summary           │
│ - Atualizar risk score      │
│ - Agendar reengagement      │
└─────────────────────────────┘
```

**Novos cron jobs:**
- `daily_risk_scorer` — Calcula dropout risk para todos usuarios
- `daily_reengagement` — Envia mensagens de re-engajamento
- `weekly_report` — Envia relatorio semanal motivacional

---

## Metricas de Sucesso

| Metrica | Meta MVP | Meta 6 meses |
|---------|----------|-------------|
| Retencao dia 7 | > 60% | > 75% |
| Retencao dia 30 | > 40% | > 55% |
| Retencao dia 90 | > 25% | > 40% |
| Media sessoes/semana | > 3 | > 4 |
| Taxa de reentry (voltou apos inatividade) | > 30% | > 45% |
| Alunos que passam da Fase 1 | > 40% | > 55% |
| Alunos que completam ate Fase 3 | > 15% | > 25% |
| Streak medio | > 5 dias | > 10 dias |

---

## Resumo: Os 7 Mecanismos

| # | Mecanismo | O que resolve | Quando atua |
|---|-----------|--------------|-------------|
| 1 | Micro-completude | "Nao fiz nada hoje" | TODA sessao |
| 2 | Formato nunca repete | "Enjoei, sempre igual" | TODA atividade |
| 3 | Re-engajamento proativo | "Esqueci que existia" | Dias 2-30 de inatividade |
| 4 | Zero culpa | "Vergonha de voltar" | Quando aluno volta |
| 5 | Dificuldade adaptativa | "Muito facil/dificil" | CADA interacao |
| 6 | Progresso sempre visivel | "Nao sei se to evoluindo" | Apos cada vitoria + semanal |
| 7 | Compromisso de 30 segundos | "Nao tenho tempo hoje" | Quando aluno diz "cansei" |

**Juntos, esses 7 mecanismos criam um sistema onde:**
- Comecar e FACIL (30 segundos)
- Continuar e DIVERTIDO (formatos variados)
- Pausar e OK (zero culpa)
- Voltar e CELEBRADO (nao punido)
- Desistir e DIFICIL (o sistema vem ate voce)
- Progredir e VISIVEL (a cada passo)

---

*— Aria, arquitetando o futuro 🏗️*
