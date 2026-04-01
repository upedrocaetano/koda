# Arquitetura Monorepo — Koda Web + WhatsApp

**Autor:** Aria (@architect)
**Data:** 2026-03-31
**Status:** Proposta
**Versão:** 1.0

---

## 1. Contexto e Motivação

O Koda nasceu como um professor de programação via WhatsApp (Epic 1). A estrutura atual é um backend Hono monolítico em `src/` com pipeline de 10 etapas, FSM, classificador de intenção via Claude Haiku, sistema de gamificação (XP, streaks, levels) e integração com Evolution API.

O pivot adiciona um **web app com tema Matrix** (verde neon, code rain, terminal aesthetic) como canal primário, mantendo WhatsApp como canal secundário. Isso exige:

1. **Extrair o core intelectual** (pipeline, FSM, classificador, gamificação, lições) em pacotes reutilizáveis
2. **Criar o web app** Next.js com Supabase Auth, Monaco Editor e design system Matrix
3. **Manter o backend WhatsApp** funcionando como app independente
4. **Compartilhar** prompts, currículo e tipos entre ambos

### O que NÃO muda

- Schema do Supabase (tabelas users, progress, interactions, etc.)
- Lógica da FSM (IDLE → ONBOARDING → HUB → LESSON → GATE → HUB)
- Sistema de 3 portões por conceito
- Tabela de XP e cálculo de levels
- Prompts de 6 camadas do context builder

### O que muda

- **Autenticação:** de phone-only (Evolution) para Supabase Auth (email + Google OAuth)
- **Delivery:** de WhatsApp-only para Web (primário) + WhatsApp (secundário)
- **UI:** de texto formatado para interface visual com Matrix theme
- **Code exercises:** de texto no chat para Monaco Editor integrado
- **User identity:** campo `auth_id` (UUID do Supabase Auth) como chave primária de identidade, `phone` como campo opcional

---

## 2. Estrutura do Monorepo

```
koda/
├── apps/
│   ├── web/                          # Next.js 16 — canal primário
│   │   ├── app/                      # App Router (Server Components por default)
│   │   │   ├── (auth)/               # Route group: login, signup, callback
│   │   │   │   ├── login/page.tsx
│   │   │   │   ├── signup/page.tsx
│   │   │   │   └── callback/route.ts # Supabase Auth callback
│   │   │   ├── (app)/                # Route group: app autenticado
│   │   │   │   ├── layout.tsx        # Shell com sidebar Matrix
│   │   │   │   ├── hub/page.tsx      # Hub central (dashboard)
│   │   │   │   ├── lesson/
│   │   │   │   │   ├── page.tsx      # Aula atual
│   │   │   │   │   └── [conceptId]/page.tsx
│   │   │   │   ├── playground/page.tsx  # Monaco Editor sandbox
│   │   │   │   ├── progress/page.tsx    # Progresso e achievements
│   │   │   │   └── settings/page.tsx    # Perfil e preferências
│   │   │   ├── api/                  # Route Handlers (thin layer)
│   │   │   │   ├── chat/route.ts     # Streaming de respostas do Claude
│   │   │   │   └── code/run/route.ts # Execução segura de código
│   │   │   ├── layout.tsx            # Root layout (Matrix fonts, theme)
│   │   │   └── page.tsx              # Landing page (code rain animation)
│   │   ├── components/               # Componentes específicos do web
│   │   │   ├── chat/                 # Chat interface (estilo terminal)
│   │   │   ├── code-editor/          # Wrapper do Monaco Editor
│   │   │   ├── effects/              # Code rain, glitch, terminal cursor
│   │   │   └── lesson/               # Componentes de aula (gates, progress bar)
│   │   ├── lib/                      # Utilities do web app
│   │   │   ├── supabase/
│   │   │   │   ├── client.ts         # Browser client (anon key)
│   │   │   │   ├── server.ts         # Server client (cookies-based)
│   │   │   │   └── middleware.ts      # Session refresh
│   │   │   └── actions/              # Server Actions
│   │   │       ├── lesson.ts         # Ações de aula (next, submit gate)
│   │   │       ├── progress.ts       # Ações de progresso
│   │   │       └── onboarding.ts     # Ações de onboarding
│   │   ├── hooks/                    # React hooks
│   │   │   ├── use-realtime.ts       # Supabase Realtime subscription
│   │   │   └── use-typing-effect.ts  # Efeito de digitação Matrix
│   │   ├── next.config.ts
│   │   ├── middleware.ts             # Auth guard + session refresh
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── whatsapp/                     # Hono backend — canal secundário
│       ├── src/
│       │   ├── routes/
│       │   │   ├── health.ts
│       │   │   └── webhook.ts        # Recebe mensagens da Evolution API
│       │   ├── services/
│       │   │   └── evolution.ts      # Evolution API client (WhatsApp-specific)
│       │   ├── adapters/
│       │   │   └── whatsapp-adapter.ts  # Adapta PipelineInput/Output para WhatsApp
│       │   └── index.ts              # Entry point Hono
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── core/                         # Motor de IA e orquestração
│   │   ├── src/
│   │   │   ├── pipeline/             # Pipeline de processamento
│   │   │   │   ├── pipeline.ts       # processMessage() — orquestrador principal
│   │   │   │   ├── receive.ts        # Etapa 1: parse input
│   │   │   │   ├── identify-user.ts  # Etapa 2: buscar/criar usuário
│   │   │   │   ├── rate-limit.ts     # Etapa 3: rate limiting
│   │   │   │   ├── classify-intent.ts # Etapa 4: classificação via Haiku
│   │   │   │   ├── state-transition.ts # Etapa 5: transição FSM
│   │   │   │   ├── build-context.ts  # Etapa 6: montar prompt 6 camadas
│   │   │   │   ├── ai-engine.ts      # Etapa 7: chamada ao Claude Sonnet
│   │   │   │   ├── post-process.ts   # Etapa 8: pós-processamento
│   │   │   │   ├── format-send.ts    # Etapa 9: formatação (channel-agnostic)
│   │   │   │   └── log-update.ts     # Etapa 10: log e persistência
│   │   │   ├── classifier.ts         # IntentType, classifyIntent()
│   │   │   ├── context-builder.ts    # buildLessonContext() — 6 camadas
│   │   │   ├── state-machine.ts      # FSM pura — transition(), TRANSITION_TABLE
│   │   │   ├── ai-client.ts          # Anthropic client factory (getClaude)
│   │   │   └── index.ts              # Public API exports
│   │   ├── tsconfig.json
│   │   └── package.json              # @koda/core
│   │
│   ├── gamification/                 # XP, levels, streaks, achievements
│   │   ├── src/
│   │   │   ├── xp-calculator.ts      # calculateXP(), calculateLevel() — funções puras
│   │   │   ├── streak-tracker.ts     # updateStreak() — precisa de DB
│   │   │   ├── progress-display.ts   # formatXPNotification(), formatLevelUp()
│   │   │   ├── achievements.ts       # Sistema de badges e achievements
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json              # @koda/gamification
│   │
│   ├── lesson/                       # Handler de aulas e portões
│   │   ├── src/
│   │   │   ├── handler.ts            # handleLesson() — orquestra aula
│   │   │   ├── gate-evaluator.ts     # evaluateGate() — avalia portões
│   │   │   ├── curriculum-loader.ts  # Carrega currículo de YAML/JSON
│   │   │   ├── onboarding.ts         # handleOnboarding()
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json              # @koda/lesson
│   │
│   ├── db/                           # Schema, queries e Supabase client
│   │   ├── src/
│   │   │   ├── schema.ts             # Tipos TypeScript (User, Progress, etc.)
│   │   │   ├── client.ts             # Factory de Supabase client (server/browser)
│   │   │   ├── queries/
│   │   │   │   ├── users.ts          # findUserByPhone, findUserByAuthId, updateUserProfile
│   │   │   │   ├── conversation-state.ts # getState, setState
│   │   │   │   ├── gamification.ts   # awardXP
│   │   │   │   ├── progress.ts       # getProgress, updateProgress
│   │   │   │   └── interactions.ts   # logInteraction
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json              # @koda/db
│   │
│   ├── ui/                           # Design System Matrix (shadcn-based)
│   │   ├── src/
│   │   │   ├── primitives/           # Componentes base shadcn customizados
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── progress.tsx      # Barra de progresso com glow neon
│   │   │   │   ├── badge.tsx         # Badge com efeito terminal
│   │   │   │   └── toast.tsx
│   │   │   ├── composed/            # Componentes compostos do Koda
│   │   │   │   ├── xp-bar.tsx       # Barra de XP com animação
│   │   │   │   ├── streak-badge.tsx # Badge de streak com fogo
│   │   │   │   ├── level-badge.tsx  # Badge de nível
│   │   │   │   ├── gate-indicator.tsx # Indicador visual dos 3 portões
│   │   │   │   └── terminal-text.tsx  # Texto com efeito terminal
│   │   │   ├── effects/
│   │   │   │   ├── code-rain.tsx     # Canvas API code rain animation
│   │   │   │   ├── glitch-text.tsx   # Efeito glitch em texto
│   │   │   │   └── neon-glow.tsx     # Utility de glow CSS
│   │   │   ├── tokens/
│   │   │   │   ├── colors.ts         # Paleta Matrix (greens, blacks, accents)
│   │   │   │   ├── typography.ts     # Font stack (monospace + display)
│   │   │   │   ├── spacing.ts
│   │   │   │   └── animations.ts     # Keyframes do tema
│   │   │   ├── tailwind-preset.ts    # Preset Tailwind com tokens Matrix
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json              # @koda/ui
│   │
│   └── shared/                       # Tipos compartilhados e utilidades
│       ├── src/
│       │   ├── types.ts              # Tipos cross-package (ChannelType, etc.)
│       │   ├── logger.ts             # Logger unificado
│       │   ├── idempotency.ts        # Idempotency key utils
│       │   ├── constants.ts          # Constantes globais
│       │   └── index.ts
│       ├── tsconfig.json
│       └── package.json              # @koda/shared
│
├── resources/                        # Conteúdo compartilhado (não é código)
│   ├── prompts/                      # Prompts do Claude (markdown)
│   │   ├── base-personality.md
│   │   ├── classifier.md
│   │   ├── lesson.md
│   │   ├── gate-1-comprehension.md
│   │   ├── gate-2-practice.md
│   │   ├── onboarding.md
│   │   └── output-instructions.md
│   └── curriculum/                   # Currículo em YAML
│       ├── modules/
│       │   ├── 01-logica-programacao.yaml
│       │   ├── 02-html-css.yaml
│       │   ├── 03-javascript.yaml
│       │   └── ...
│       └── curriculum-schema.yaml    # Schema de validação
│
├── supabase/                         # Supabase local (migrations, seeds, config)
│   ├── migrations/
│   │   ├── 00001_initial_schema.sql
│   │   └── 00002_add_auth_id.sql     # Nova migration para auth_id
│   ├── seed.sql
│   └── config.toml
│
├── turbo.json                        # Turborepo pipeline config
├── package.json                      # Root workspace config
├── tsconfig.base.json                # TypeScript base config compartilhado
├── .env.example
└── .gitignore
```

---

## 3. Fronteiras de Pacotes — O que vai onde

### 3.1 `@koda/core` — Motor de IA

**Responsabilidade:** Toda a lógica de processamento de mensagens, independente de canal.

**Contém (migrado de `src/core/`):**
- `pipeline.ts` — `processMessage()` refatorado para ser channel-agnostic
- `state-machine.ts` — FSM pura (já é sem side effects)
- `classifier.ts` — `classifyIntent()` via Claude Haiku
- `context-builder.ts` — `buildLessonContext()` com 6 camadas
- `ai-client.ts` — factory do Anthropic SDK (extraído de `src/services/claude.ts`)
- Todos os 10 stages do pipeline (`src/core/pipeline/`)

**Refatoração necessária:**
- `pipeline.ts` atualmente importa `sendMessage` e `sendTypingIndicator` de `evolution.ts` — precisa receber um **DeliveryAdapter** por injeção de dependência
- `identify-user.ts` atualmente busca por phone — precisa suportar busca por `auth_id`
- `context-builder.ts` carrega prompts de `process.cwd()/prompts` — precisa receber path ou loader configurável

**Interface do DeliveryAdapter:**
```typescript
// packages/core/src/delivery-adapter.ts
export interface DeliveryAdapter {
  sendMessage(recipientId: string, text: string): Promise<void>
  sendTypingIndicator(recipientId: string): Promise<void>
}

// Em apps/whatsapp — implementa com Evolution API
// Em apps/web — implementa com Supabase Realtime (ou retorna no response)
```

**Interface do UserResolver:**
```typescript
// packages/core/src/user-resolver.ts
export interface UserResolver {
  identify(identifier: string): Promise<User>
}

// WhatsApp: resolve por phone
// Web: resolve por auth_id (do JWT do Supabase Auth)
```

**Dependências:** `@koda/db`, `@koda/shared`, `@anthropic-ai/sdk`

### 3.2 `@koda/gamification` — Progressão e Recompensas

**Responsabilidade:** XP, levels, streaks, achievements — tudo relacionado a motivação.

**Contém (migrado de `src/modules/gamification/`):**
- `xp-calculator.ts` — funções puras, zero dependências externas
- `streak-tracker.ts` — `updateStreak()` (depende de `@koda/db`)
- `progress-display.ts` — formatação de notificações

**Nota:** `progress-display.ts` precisa ser split:
- Funções puras de dados ficam em `@koda/gamification`
- Componentes visuais (React) vão para `@koda/ui` (`xp-bar.tsx`, `streak-badge.tsx`)

**Dependências:** `@koda/db`, `@koda/shared`

### 3.3 `@koda/lesson` — Aulas e Portões

**Responsabilidade:** Handler de aulas, avaliação de portões, carregamento de currículo.

**Contém (migrado de `src/modules/lesson/` e `src/modules/onboarding/`):**
- `handler.ts` — `handleLesson()` (coração do ensino)
- `gate-evaluator.ts` — `evaluateGate()` com 3 tipos de portão
- `onboarding.ts` — `handleOnboarding()` (fluxo de boas-vindas)
- `curriculum-loader.ts` — **novo**, carrega currículo de YAML (substitui o hardcoded `CURRICULUM` no handler)

**Refatoração necessária:**
- O `CURRICULUM` hardcoded em `handler.ts` precisa virar YAML em `resources/curriculum/`
- `curriculum-loader.ts` carrega, valida e cacheia o currículo em memória
- Separar a lógica de `updateProgress()` (que está dentro do handler) para `@koda/db`

**Dependências:** `@koda/core`, `@koda/db`, `@koda/gamification`, `@koda/shared`

### 3.4 `@koda/db` — Camada de Dados

**Responsabilidade:** Tipos do schema, queries e factory de Supabase client.

**Contém (migrado de `src/db/` e `src/services/supabase.ts`):**
- `schema.ts` — todos os tipos TypeScript (User, Progress, etc.)
- `client.ts` — factory que cria client server-side (service_role) ou browser-side (anon key)
- `queries/` — todas as query functions existentes + novas

**Novos queries necessários:**
```typescript
// queries/users.ts — novo
export async function findUserByAuthId(authId: string): Promise<User | null>
export async function createUserFromAuth(authUser: AuthUser): Promise<User>
export async function linkPhoneToUser(userId: string, phone: string): Promise<void>

// queries/progress.ts — extraído do lesson handler
export async function getProgress(userId: string, conceptId: string): Promise<Progress | null>
export async function upsertProgress(userId: string, conceptId: string, data: Partial<Progress>): Promise<void>
```

**Client factory:**
```typescript
// packages/db/src/client.ts
import { createClient } from '@supabase/supabase-js'

export type ClientMode = 'server' | 'browser'

export function createSupabaseClient(mode: ClientMode) {
  if (mode === 'server') {
    // Usa service_role_key — para backend e Server Components
    return createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  // Usa anon key — para browser (RLS enforced)
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Dependências:** `@supabase/supabase-js`, `@koda/shared`

### 3.5 `@koda/ui` — Design System Matrix

**Responsabilidade:** Componentes React reutilizáveis com tema Matrix.

**Baseado em:** shadcn/ui customizado com tokens Matrix.

**Design tokens (cores):**
```typescript
// packages/ui/src/tokens/colors.ts
export const matrixColors = {
  // Backgrounds
  black: '#0D0D0D',           // Fundo principal
  darkGreen: '#0A1A0A',       // Fundo secundário
  terminal: '#0F1A0F',        // Fundo de terminal/editor

  // Greens (hierarquia)
  neon: '#00FF41',             // Primary — texto principal, CTAs
  bright: '#39FF14',           // Accent — hover, focus
  medium: '#00CC33',           // Secondary — texto secundário
  dim: '#008F11',              // Muted — bordas, textos terciários
  faded: '#003B00',            // Subtle — backgrounds de hover

  // Accent colors (usados com moderação)
  amber: '#FFB000',            // Warnings, streaks
  red: '#FF0040',              // Errors, XP loss
  cyan: '#00FFFF',             // Links, special highlights
  purple: '#9D00FF',           // Achievements, rare items

  // Utility
  white: '#E0E0E0',            // Texto em contexts específicos
  gray: '#4A4A4A',             // Disabled, placeholders
}
```

**Dependências:** `react`, `tailwindcss`, `class-variance-authority`, `clsx`, `tailwind-merge`

### 3.6 `@koda/shared` — Tipos e Utilidades Comuns

**Responsabilidade:** Coisas que todos os pacotes precisam mas que não pertencem a nenhum domínio.

**Contém:**
- `types.ts` — `ChannelType`, `KodaConfig`, tipos de mensagem genéricos
- `logger.ts` — logger unificado (migrado de `src/utils/logger.ts`)
- `idempotency.ts` — idempotency key utils (migrado de `src/utils/idempotency.ts`)
- `constants.ts` — timeouts, limites, defaults

**Dependências:** nenhuma (leaf package)

---

## 4. Grafo de Dependências

```
                    ┌──────────────┐
                    │  @koda/shared │  (leaf — sem dependências)
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
        ┌─────┴─────┐ ┌───┴────┐ ┌────┴──────┐
        │  @koda/db  │ │@koda/ui│ │@koda/gamif│
        └─────┬─────┘ └────────┘ └────┬──────┘
              │                        │
              │    ┌───────────────────┘
              │    │
        ┌─────┴────┴──┐
        │  @koda/core  │
        └──────┬───────┘
               │
        ┌──────┴───────┐
        │ @koda/lesson  │
        └──────┬───────┘
               │
       ┌───────┴───────┐
       │               │
  ┌────┴─────┐  ┌──────┴──────┐
  │ apps/web │  │apps/whatsapp│
  └──────────┘  └─────────────┘
```

**Regra:** dependências fluem para baixo. `@koda/shared` não importa nenhum outro pacote. `apps/` importam `packages/` mas nunca o contrário.

**Regras de importação por camada:**

| Pacote | Pode importar | NÃO pode importar |
|--------|--------------|-------------------|
| `@koda/shared` | nada | qualquer @koda/* |
| `@koda/db` | `@koda/shared` | core, lesson, gamification, ui |
| `@koda/ui` | `@koda/shared` | core, lesson, gamification, db |
| `@koda/gamification` | `@koda/shared`, `@koda/db` | core, lesson, ui |
| `@koda/core` | `@koda/shared`, `@koda/db`, `@koda/gamification` | lesson, ui |
| `@koda/lesson` | `@koda/shared`, `@koda/db`, `@koda/core`, `@koda/gamification` | ui |
| `apps/web` | todos os @koda/* | apps/whatsapp |
| `apps/whatsapp` | todos os @koda/* exceto ui | apps/web |

---

## 5. Como o Web App se Comunica com o Core

### Princípio: Import Direto, não HTTP

O web app Next.js importa `@koda/core`, `@koda/lesson`, `@koda/gamification` e `@koda/db` **diretamente** como dependências do workspace. Não existe API HTTP entre eles.

A comunicação acontece em **Server Components** e **Server Actions**, que rodam no servidor Node.js do Next.js onde os pacotes estão disponíveis.

### Fluxo: Aluno envia mensagem no web app

```
Browser                    Server (Next.js)                  Supabase
  │                              │                              │
  │ 1. User types message        │                              │
  │ ─────────────────────────►   │                              │
  │    (Server Action)           │                              │
  │                              │ 2. Validate JWT              │
  │                              │ ─────────────────────────►   │
  │                              │ ◄─────────────────────────   │
  │                              │                              │
  │                              │ 3. processMessage({          │
  │                              │      authId: user.id,        │
  │                              │      text: message,          │
  │                              │      channel: 'web'          │
  │                              │    })                        │
  │                              │    [import from @koda/core]  │
  │                              │                              │
  │                              │ 4. Pipeline executa          │
  │                              │    etapas 1-10               │
  │                              │ ───── queries ────────────►  │
  │                              │ ◄──── results ────────────   │
  │                              │                              │
  │ 5. Return response           │                              │
  │ ◄─────────────────────────   │                              │
  │    (streamed or full)        │                              │
  │                              │                              │
  │ 6. Realtime: XP update       │                              │
  │ ◄───────────────────────────────── Supabase Realtime ────   │
```

### Server Action — Exemplo concreto

```typescript
// apps/web/lib/actions/lesson.ts
'use server'

import { processMessage } from '@koda/core'
import { WebDeliveryAdapter } from '../adapters/web-adapter'
import { createServerClient } from '@koda/db'
import { cookies } from 'next/headers'

export async function sendLessonMessage(text: string) {
  // 1. Auth — pega user do JWT no cookie
  const supabase = createServerClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  // 2. Processar mensagem usando o core
  const result = await processMessage({
    identifier: user.id,       // auth_id, não phone
    text,
    messageType: 'text',
    messageId: crypto.randomUUID(),
    channel: 'web',
    deliveryAdapter: new WebDeliveryAdapter(),  // no-op para web
  })

  // 3. Retornar resultado (sem enviar via Evolution API)
  return {
    responseText: result.responseText,
    xpEarned: result.xpEarned,
    newState: result.newState,
    intent: result.intent,
  }
}
```

### Streaming de Respostas do Claude

Para a experiência "digitando" no web, usamos Route Handler com streaming:

```typescript
// apps/web/app/api/chat/route.ts
import { streamMessage } from '@koda/core/streaming'

export async function POST(req: Request) {
  const { text } = await req.json()

  // Autenticação via Supabase cookie
  const user = await getAuthUser(req)
  if (!user) return new Response('Unauthorized', { status: 401 })

  // Stream a resposta do Claude
  const stream = await streamMessage({
    identifier: user.id,
    text,
    channel: 'web',
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' },
  })
}
```

---

## 6. Autenticação

### Supabase Auth — Fluxo Completo

```
┌─────────────────┐     ┌────────────────────┐     ┌──────────────┐
│   Landing Page   │────►│  /login             │────►│ Supabase Auth│
│   (code rain)    │     │  email + senha      │     │ GoTrue       │
│                  │     │  OU Google OAuth    │     │              │
└─────────────────┘     └────────────────────┘     └──────┬───────┘
                                                          │
                               ┌──────────────────────────┘
                               │ JWT cookie set
                               ▼
                        ┌─────────────────┐
                        │ /callback        │  (exchange code for session)
                        │ route.ts         │
                        └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │ middleware.ts     │  (refresh session on every request)
                        │ verifica JWT     │
                        └────────┬────────┘
                                 │
                        ┌────────┴────────┐
                        │                 │
                   auth OK            auth fail
                        │                 │
                        ▼                 ▼
                  ┌──────────┐     ┌───────────┐
                  │ (app)/   │     │ redirect   │
                  │ hub, etc │     │ /login     │
                  └──────────┘     └───────────┘
```

### Middleware Next.js

```typescript
// apps/web/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Rotas protegidas
  if (!user && request.nextUrl.pathname.startsWith('/(app)')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/health).*)'],
}
```

### Schema de Usuário — Ponte Auth <> App

A tabela `users` ganha um campo `auth_id`:

```sql
-- supabase/migrations/00002_add_auth_id.sql
ALTER TABLE users ADD COLUMN auth_id UUID UNIQUE REFERENCES auth.users(id);

-- Índice para busca rápida
CREATE INDEX idx_users_auth_id ON users(auth_id);

-- RLS: usuário só vê seus próprios dados
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = auth_id);

-- Trigger: criar registro na tabela users quando um novo auth user é criado
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_id, phone, name, level, total_xp, current_streak, max_streak, onboarding_completed, timezone, preferences)
  VALUES (
    NEW.id,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NULL),
    'beginner',
    0,
    0,
    0,
    false,
    'America/Sao_Paulo',
    '{}'::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
```

### RLS Policies para Todas as Tabelas

```sql
-- Progress: usuário vê/edita só o próprio progresso
CREATE POLICY "Users own progress" ON progress
  FOR ALL USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Interactions: usuário vê suas interações
CREATE POLICY "Users own interactions" ON interactions
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Conversation State: usuário vê/edita próprio estado
CREATE POLICY "Users own state" ON conversation_state
  FOR ALL USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Gamification: usuário vê próprias conquistas
CREATE POLICY "Users own gamification" ON gamification
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Modules e Concepts: todos podem ler (currículo é público)
CREATE POLICY "Modules are public" ON modules FOR SELECT USING (true);
CREATE POLICY "Concepts are public" ON concepts FOR SELECT USING (true);
```

---

## 7. Real-time com Supabase Realtime

### Uso no Web App

Supabase Realtime é usado para atualizar a UI sem polling:

| Canal | Tabela | Evento | Uso no Frontend |
|-------|--------|--------|-----------------|
| XP updates | `users` | UPDATE (total_xp, current_streak) | Atualizar barra de XP e streak em tempo real |
| Progress | `progress` | INSERT/UPDATE | Gate passed — animação de sucesso |
| Gamification | `gamification` | INSERT | Toast de achievement/level up |
| State | `conversation_state` | UPDATE | Sincronizar estado entre abas |

### Hook de Realtime

```typescript
// apps/web/hooks/use-realtime.ts
'use client'

import { useEffect } from 'react'
import { createBrowserClient } from '@koda/db'

export function useRealtimeXP(userId: string, onXPUpdate: (xp: number) => void) {
  useEffect(() => {
    const supabase = createBrowserClient()

    const channel = supabase
      .channel('xp-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new.total_xp !== payload.old.total_xp) {
            onXPUpdate(payload.new.total_xp)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, onXPUpdate])
}
```

---

## 8. Decisões Técnicas

### 8.1 Next.js 16 com App Router

**Por quê:** Server Components por default reduzem JS no browser. Server Actions eliminam a necessidade de API routes para mutações. O web app é read-heavy (mostrar aulas, progresso) — Server Components são ideais.

**Layout do App Router:**
- `(auth)/` — route group para login/signup (layout sem sidebar)
- `(app)/` — route group para app autenticado (layout com sidebar Matrix + header com XP)
- `api/` — Route Handlers apenas para streaming (chat) e execução de código

### 8.2 Tailwind CSS com Preset Matrix

O design system usa um **Tailwind preset** em `@koda/ui` que todos os apps importam:

```typescript
// packages/ui/src/tailwind-preset.ts
import type { Config } from 'tailwindcss'
import { matrixColors } from './tokens/colors'

export const matrixPreset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        matrix: matrixColors,
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Share Tech Mono', 'monospace'],
      },
      animation: {
        'code-rain': 'codeRain 20s linear infinite',
        'neon-pulse': 'neonPulse 2s ease-in-out infinite',
        'terminal-blink': 'terminalBlink 1s step-end infinite',
        'glitch': 'glitch 0.3s ease-in-out',
      },
      boxShadow: {
        'neon': '0 0 5px #00FF41, 0 0 10px #00FF41, 0 0 20px #00FF41',
        'neon-sm': '0 0 3px #00FF41, 0 0 6px #00FF41',
      },
    },
  },
}
```

### 8.3 shadcn/ui como Base de Componentes

shadcn é copy-paste, não pacote npm — perfeito para customização profunda. Os componentes são copiados para `@koda/ui/src/primitives/` e customizados com o tema Matrix (bordas neon, fundos escuros, fontes mono).

### 8.4 Canvas API para Code Rain

A animação de code rain (landing page e backgrounds) usa Canvas API puro, não biblioteca. Razões:
- Performance: Canvas nativo é mais rápido que DOM/CSS para milhares de caracteres caindo
- Controle: podemos customizar caracteres (código real vs. Matrix kanji)
- Bundle size: zero dependências

### 8.5 Monaco Editor para Exercícios de Código

Monaco Editor (o editor do VS Code) é integrado para exercícios:
- Syntax highlighting para JavaScript/TypeScript/HTML/CSS
- Autocomplete básico
- Erros inline (validação local, não execução)
- Tema Matrix customizado (background escuro, syntax colors neon)

**Carregamento:** dynamic import com `next/dynamic` e `ssr: false` — Monaco não funciona em Server Components.

```typescript
// apps/web/components/code-editor/monaco-editor.tsx
'use client'

import dynamic from 'next/dynamic'

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

export function CodeEditor({ value, onChange, language = 'javascript' }) {
  return (
    <Editor
      height="300px"
      language={language}
      value={value}
      onChange={onChange}
      theme="koda-matrix"  // tema customizado
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily: 'JetBrains Mono',
        lineNumbers: 'on',
        roundedSelection: false,
        scrollBeyondLastLine: false,
        automaticLayout: true,
      }}
    />
  )
}
```

### 8.6 Execução de Código — Sandbox Seguro

Exercícios de código precisam de execução segura. Abordagem:

**Fase 1 (MVP):** Execução client-side via Web Worker com iframe sandbox.
- `Function()` constructor dentro de Web Worker isolado
- Timeout de 5 segundos
- Console interceptado para capturar output
- Sem acesso a DOM, network, filesystem

**Fase 2 (futuro):** Backend sandboxed com WebContainers ou container Docker.

---

## 9. Configuração Turborepo

```jsonc
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

```jsonc
// package.json (root)
{
  "name": "koda",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo dev",
    "dev:web": "turbo dev --filter=@koda/web",
    "dev:whatsapp": "turbo dev --filter=@koda/whatsapp",
    "build": "turbo build",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "test": "turbo test"
  },
  "devDependencies": {
    "turbo": "^2.4.0",
    "typescript": "^5.7.0"
  },
  "packageManager": "npm@10.0.0"
}
```

---

## 10. Plano de Migração

### Fase 0: Setup do Monorepo (sem mudar código)

1. Instalar Turborepo no root
2. Criar `turbo.json` e `tsconfig.base.json`
3. Mover `src/` inteiro para `apps/whatsapp/src/` — o WhatsApp app continua funcionando idêntico
4. Mover `prompts/` para `resources/prompts/`
5. Ajustar imports e paths no app whatsapp
6. Verificar: `npm run dev:whatsapp` funciona igual ao `npm run dev` atual

**Resultado:** Monorepo funcional com 1 app, zero regressões.

### Fase 1: Extrair `@koda/shared` e `@koda/db`

1. Criar `packages/shared/` com logger, idempotency, constants, types
2. Criar `packages/db/` com schema.ts, client.ts, queries/
3. Atualizar imports em `apps/whatsapp/` para usar `@koda/shared` e `@koda/db`
4. Verificar: testes passam, WhatsApp funciona

**Resultado:** 2 pacotes extraídos, app whatsapp usa imports de workspace.

### Fase 2: Extrair `@koda/gamification`

1. Criar `packages/gamification/` com xp-calculator, streak-tracker, progress-display
2. Atualizar imports em `apps/whatsapp/`
3. Verificar: testes de gamificação passam

### Fase 3: Extrair `@koda/core`

1. Criar `packages/core/` com pipeline, FSM, classifier, context-builder, ai-client
2. Introduzir `DeliveryAdapter` interface — `apps/whatsapp` implementa `WhatsAppDeliveryAdapter`
3. Introduzir `UserResolver` interface — `apps/whatsapp` implementa `PhoneUserResolver`
4. Refatorar `pipeline.ts` para receber adapters via parâmetro (não importar `evolution.ts`)
5. Refatorar `context-builder.ts` para receber prompt loader configurável
6. Verificar: pipeline funciona com adapters injetados

**Resultado:** Core channel-agnostic. WhatsApp usa adapters para Evolution API.

### Fase 4: Extrair `@koda/lesson`

1. Criar `packages/lesson/` com handler, gate-evaluator, onboarding
2. Criar `curriculum-loader.ts` e mover currículo hardcoded para `resources/curriculum/`
3. Extrair `updateProgress()` do handler para `@koda/db`
4. Verificar: aulas e portões funcionam

### Fase 5: Criar `@koda/ui` e `apps/web`

1. Criar `packages/ui/` com tokens, preset Tailwind, componentes primitivos
2. Criar `apps/web/` com Next.js App Router
3. Implementar autenticação (Supabase Auth + middleware)
4. Implementar hub, lesson, progress pages usando `@koda/core` e `@koda/lesson`
5. Implementar chat interface com streaming
6. Implementar Monaco Editor para exercícios
7. Implementar code rain e efeitos Matrix

### Fase 6: Migration do banco

1. Criar migration `00002_add_auth_id.sql` (campo + RLS policies)
2. Criar trigger de auto-criação de user no signup
3. Testar RLS: browser client só vê dados do próprio usuário
4. Habilitar Supabase Realtime nas tabelas necessárias

---

## 11. Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Refatoração do pipeline quebra WhatsApp | Alto | Fase 0 garante WhatsApp funcional antes de extrair. Cada fase tem checkpoint de testes. |
| Monaco Editor pesado no bundle | Médio | Dynamic import com code splitting. Lazy load somente na página de exercício. |
| RLS policies complexas | Médio | Testar com Supabase local (`supabase start`) antes de deploy. Queries do backend continuam usando service_role. |
| Curriculum hardcoded difícil de migrar | Baixo | O CURRICULUM no handler.ts tem apenas 3 conceitos. Migrar para YAML é mecânico. |
| DeliveryAdapter abstraction leak | Médio | Interface mínima (2 métodos). Se precisar de mais, revisar a abstração antes de adicionar. |
| Turborepo cache invalidation | Baixo | `turbo.json` com `dependsOn: ["^build"]` garante rebuild de dependentes. |

---

## 12. Referências

- Estrutura atual do código: `src/`
- Schema do banco: `src/db/schema.ts`
- Prompts: `prompts/`
- Pipeline de 10 etapas: `src/core/pipeline.ts`
- Gamificação: `src/modules/gamification/`
- Lesson handler: `src/modules/lesson/handler.ts`
