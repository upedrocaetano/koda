---
id: "EPIC-2"
title: "Web App Matrix — Interface Web do Koda"
status: "Planned"
total_stories: 10
estimated_points: 62
created_by: "@pm"
created_at: "2026-03-31"
---

# Epic 2 — Web App Matrix

## Objetivo

Construir a interface web do Koda usando Next.js 16, com design system inspirado no universo Matrix. O Web App complementa a experiencia WhatsApp, oferecendo dashboard de progresso, chat interativo, playground de codigo e mapa visual de aprendizado. Tudo sincronizado com o backend existente (Epic 1) via Supabase.

## Visao

Pedro aprende programacao pelo WhatsApp (micro-sessoes rapidas) e acompanha seu progresso no Web App (visao macro, playground, badges). O design Matrix reforsa a identidade do Koda como guia no mundo da programacao — o aluno e Neo, o Koda e Morpheus.

## Success Metrics

| Metrica | Target | Como medir |
|---------|--------|------------|
| Tempo de carregamento inicial | < 2s | Lighthouse Performance |
| Autenticacao funcional | 100% | Login email + Google OAuth sem erros |
| Sincronizacao WhatsApp <-> Web | Tempo real | Dados de progresso consistentes entre canais |
| Score de acessibilidade | >= 80 | Lighthouse Accessibility |
| Cobertura de testes | >= 80% | Jest + Testing Library |
| Mobile-first responsivo | 100% | Funcional em 320px-1920px |

## Stack Tecnica

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Framework | Next.js 16 (App Router) | SSR, RSC, Server Actions |
| Styling | Tailwind CSS 4 | Utility-first, customizavel |
| Design System | CSS Variables + Tailwind | Tema Matrix (verde fosforescente) |
| Auth | Supabase Auth | Ja integrado no backend |
| State | Zustand | Leve, simples, TypeScript-first |
| Editor | Monaco Editor | VS Code no browser |
| Animacoes | Framer Motion | Animacoes fluidas |
| Monorepo | Turborepo | Build cache, shared packages |
| Deploy | Vercel | Integrado com Next.js |

## Design System — Matrix Theme

### Paleta de Cores

| Token | Valor | Uso |
|-------|-------|-----|
| `--matrix-green` | `#00FF41` | Texto principal, destaque, XP |
| `--matrix-green-dim` | `#00CC33` | Texto secundario |
| `--matrix-green-glow` | `#00FF41` com `text-shadow` | Efeitos de glow |
| `--matrix-bg` | `#0D0D0D` | Background principal |
| `--matrix-bg-card` | `#1A1A2E` | Cards e containers |
| `--matrix-bg-input` | `#16213E` | Inputs e areas de texto |
| `--matrix-accent` | `#E94560` | Erros, alertas, danger |
| `--matrix-gold` | `#FFD700` | Level-up, conquistas |
| `--matrix-cyan` | `#00D4FF` | Links, informacao |
| `--matrix-white` | `#E0E0E0` | Texto neutro |

### Tipografia

| Elemento | Font | Peso |
|----------|------|------|
| Headings | `Share Tech Mono` | 700 |
| Body | `Inter` | 400/500 |
| Code | `Fira Code` | 400 |
| Terminal | `JetBrains Mono` | 400 |

### Efeitos

- **Code Rain**: canvas animado no background (toggle on/off)
- **Glow**: `text-shadow: 0 0 10px #00FF41` em elementos importantes
- **Scanlines**: overlay CSS sutil em cards
- **Typing**: efeito de digitacao em mensagens do Koda
- **Level-up**: animacao com particulas verdes ao subir de nivel

---

## Stories

---

### Story 2.1: Setup Monorepo & Scaffold Next.js

**Complexidade:** L (8 pontos)
**Prioridade:** P0
**Dependencias:** Epic 1 completo
**Assignee:** @dev

#### Objetivo

Reestruturar o projeto como monorepo com Turborepo, extraindo modulos reutilizaveis do Epic 1 para `packages/` e criando o scaffold da aplicacao Next.js em `apps/web`. A separacao em pacotes permite que WhatsApp backend e Web App compartilhem a mesma logica de dominio (XP, niveis, FSM, tipos).

#### Acceptance Criteria

- [ ] AC1: `turbo.json` configurado na raiz com pipelines: `build`, `dev`, `lint`, `typecheck`, `test`. Cada pipeline define `dependsOn` e `outputs` corretamente
- [ ] AC2: Workspace structure criada: `apps/api` (backend Hono existente movido), `apps/web` (Next.js novo), `packages/core` (tipos e logica compartilhada), `packages/gamification` (XP, niveis, streaks), `packages/db` (schema, queries, cliente Supabase), `packages/tsconfig` (configs TypeScript compartilhadas)
- [ ] AC3: `packages/core` contem tipos exportados de `src/db/schema.ts` (interfaces User, Module, Concept, Progress, etc.), `ConversationStateEnum`, `IntentType`, e constantes de configuracao
- [ ] AC4: `packages/gamification` contem `xp-calculator.ts` e `streak-tracker.ts` extraidos de `src/modules/gamification/`, com funcoes puras re-exportadas (sem dependencia de Supabase)
- [ ] AC5: `packages/db` contem `schema.ts`, `queries/`, e `supabase.ts` com cliente configuravel (aceita tanto `service_role_key` quanto `anon_key` via parametro)
- [ ] AC6: `apps/api` funciona identicamente ao backend atual — `npm run dev` na raiz do monorepo inicia o servidor Hono na porta 3333. Todos os testes existentes passam sem modificacao
- [ ] AC7: `apps/web` criado com Next.js 16 (App Router), TypeScript strict, Tailwind CSS 4, estrutura de pastas: `app/`, `components/`, `lib/`, `hooks/`, `styles/`
- [ ] AC8: `apps/web` importa tipos e funcoes de `@koda/core`, `@koda/gamification`, `@koda/db` via workspace protocol (`workspace:*`)

#### Technical Notes

- Usar `pnpm` como package manager (requisito Turborepo)
- Cada package tem seu proprio `package.json` com `name: "@koda/..."` e `tsconfig.json` estendendo `@koda/tsconfig`
- Funcoes puras (calculateXP, calculateLevel) vao para `packages/gamification`
- Funcoes com side-effects (awardXP, updateStreak com DB) ficam em `packages/db` ou `apps/api`
- O `apps/api/package.json` deve referenciar `@koda/core`, `@koda/gamification`, `@koda/db`
- Next.js 16 usa App Router por default — nao usar Pages Router

---

### Story 2.2: Matrix Design System

**Complexidade:** M (5 pontos)
**Prioridade:** P0
**Dependencias:** 2.1
**Assignee:** @dev

#### Objetivo

Implementar o Design System Matrix como base visual do Web App. Configurar Tailwind com tokens customizados, CSS variables para o tema escuro, fontes (Share Tech Mono, Inter, Fira Code), componente de Code Rain canvas, e componentes base reutilizaveis (Button, Card, Input, Badge, ProgressBar). Todo componente segue o padrao Matrix: fundo escuro, texto verde fosforescente, efeitos de glow.

#### Acceptance Criteria

- [ ] AC1: `apps/web/tailwind.config.ts` configurado com cores customizadas: `matrix-green`, `matrix-green-dim`, `matrix-bg`, `matrix-bg-card`, `matrix-bg-input`, `matrix-accent`, `matrix-gold`, `matrix-cyan`. Todas mapeadas para CSS variables
- [ ] AC2: `apps/web/styles/globals.css` define CSS variables do tema Matrix no `:root`, inclui `@font-face` para Share Tech Mono, Inter, e Fira Code (via Google Fonts / next/font), e estilos globais (background `#0D0D0D`, texto `#E0E0E0`, scrollbar customizada verde)
- [ ] AC3: Componente `CodeRainCanvas` implementado como canvas animado de caracteres verdes caindo (estilo Matrix). Aceita props: `opacity` (0-1), `speed` (1-5), `density` (1-3). Renderiza com `requestAnimationFrame`, respeita `prefers-reduced-motion`
- [ ] AC4: Componente `MatrixButton` implementado com variantes: `primary` (fundo verde, texto escuro), `secondary` (borda verde, fundo transparente), `danger` (borda vermelha), `ghost` (sem borda). Inclui efeito glow no hover. Aceita `loading` state com spinner
- [ ] AC5: Componente `MatrixCard` implementado com fundo `matrix-bg-card`, borda sutil `matrix-green-dim/20`, cantos arredondados, e efeito scanline opcional (prop `scanlines: boolean`). Aceita `header`, `children`, `footer`
- [ ] AC6: Componente `MatrixInput` implementado com fundo `matrix-bg-input`, borda `matrix-green-dim/30`, texto verde, placeholder dim. Suporta `type: text | email | password | number`. Inclui estado de `error` com borda vermelha e mensagem
- [ ] AC7: Componente `MatrixBadge` implementado para exibir badges/tags. Variantes: `xp` (verde), `level` (dourado), `streak` (ciano), `error` (vermelho). Aceita `icon` opcional e `label` obrigatorio
- [ ] AC8: Componente `MatrixProgressBar` implementado com fundo escuro e barra verde animada. Aceita `value` (0-100), `label`, `showPercentage`. Animacao de preenchimento com `transition` suave. Glow no topo da barra

#### Technical Notes

- Usar `next/font` para carregar fontes com `display: swap`
- Code Rain usa canvas 2D — nao WebGL (performance em mobile)
- Todos os componentes exportados de `apps/web/components/ui/`
- Usar `cva` (class-variance-authority) para variantes de componentes
- Componentes devem ser Server Components por default, Client Components apenas quando necessario (interatividade)
- Testar acessibilidade: contraste minimo 4.5:1 para texto sobre fundo escuro
- `prefers-reduced-motion` desativa Code Rain e animacoes de glow

---

### Story 2.3: Autenticacao (Supabase Auth)

**Complexidade:** M (5 pontos)
**Prioridade:** P0
**Dependencias:** 2.1
**Assignee:** @dev

#### Objetivo

Implementar autenticacao completa no Web App usando Supabase Auth. O aluno pode se cadastrar/logar com email+senha ou Google OAuth. Rotas protegidas redirecionam para login. Ao criar conta, um registro na tabela `users` e criado automaticamente (vinculando auth.users com public.users). O Pedro precisa acessar seu dashboard com o mesmo email do Supabase.

#### Acceptance Criteria

- [ ] AC1: `packages/db` atualizado com `supabase-auth.ts` que exporta funcoes: `signUp(email, password)`, `signIn(email, password)`, `signInWithGoogle()`, `signOut()`, `getSession()`, `onAuthStateChange(callback)`
- [ ] AC2: Pagina `/login` criada com formulario Matrix-themed: campos email e senha, botao "Entrar", botao "Entrar com Google" (icone Google), link "Criar conta". Validacao client-side (email valido, senha >= 6 chars)
- [ ] AC3: Pagina `/signup` criada com formulario: campos nome, email, senha, confirmacao de senha. Botao "Criar conta", botao "Cadastrar com Google", link "Ja tenho conta". Validacao: senhas coincidem, email valido, nome nao vazio
- [ ] AC4: Google OAuth configurado: botao "Entrar com Google" inicia fluxo OAuth do Supabase, redirect callback em `/auth/callback` processa o token e redireciona para `/dashboard`
- [ ] AC5: Middleware de autenticacao (`apps/web/middleware.ts`) protege rotas `/dashboard/*`, `/chat/*`, `/profile/*`, `/lessons/*`. Redireciona para `/login` se nao autenticado. Rotas publicas: `/`, `/login`, `/signup`, `/auth/callback`
- [ ] AC6: Trigger SQL ou funcao no Supabase que cria registro em `public.users` automaticamente quando novo usuario se registra em `auth.users`. Campos iniciais: `id` (mesmo UUID do auth), `name` (do metadata), `email`, `total_xp: 0`, `current_streak: 0`, `level: 'curioso'`, `onboarding_completed: false`
- [ ] AC7: Hook `useAuth()` criado em `apps/web/hooks/use-auth.ts` que retorna: `user` (dados do Supabase Auth), `profile` (dados de `public.users`), `isLoading`, `isAuthenticated`, `signOut()`. Atualiza automaticamente via `onAuthStateChange`
- [ ] AC8: Apos login bem-sucedido, usuario e redirecionado para `/dashboard`. Apos logout, redirecionado para `/login`. Sessao persiste entre refreshes (cookie httpOnly)

#### Technical Notes

- Supabase Auth usa `@supabase/ssr` para Next.js App Router (nao `@supabase/auth-helpers`)
- Google OAuth requer configuracao no dashboard Supabase: Google Cloud Console OAuth credentials
- O trigger SQL para criar `public.users` a partir de `auth.users` pode ser uma Database Function + Trigger on `auth.users INSERT`
- Middleware do Next.js roda no edge — usar `createServerClient` do `@supabase/ssr`
- `getSession()` no server side usa cookies; no client side usa `onAuthStateChange`
- RLS policies do Epic 1 ja existem — verificar se `auth.uid()` funciona com o novo auth flow

---

### Story 2.4: Dashboard / Hub

**Complexidade:** M (5 pontos)
**Prioridade:** P1
**Dependencias:** 2.2, 2.3
**Assignee:** @dev

#### Objetivo

Criar a pagina principal do Web App — o Dashboard (Hub). Quando Pedro loga, ele ve de relance: seu nivel atual, XP total, streak, progresso nos modulos, e a "profecia do dia" (mensagem motivacional do Koda). O Dashboard e o centro de navegacao: daqui Pedro acessa chat, licoes, progresso e perfil.

#### Acceptance Criteria

- [ ] AC1: Pagina `/dashboard` criada como Server Component que busca dados do usuario via Supabase (SSR). Exibe: nome do usuario, nivel atual (numero + titulo), XP total, XP para proximo nivel (barra de progresso), streak atual
- [ ] AC2: Secao "Nivel" exibe o nivel em formato visual Matrix: numero grande com glow verde, titulo abaixo (ex: "Nivel 2 — Aprendiz"), barra de XP mostrando progresso ate o proximo nivel (ex: "180/500 XP"). Usa `calculateLevel` de `@koda/gamification`
- [ ] AC3: Secao "Streak" exibe dias consecutivos com icone de fogo e numero. Se streak > 0, texto verde. Se streak = 0, texto dim com mensagem "Comece um novo streak hoje!"
- [ ] AC4: Secao "Modulos" lista os modulos do curriculo com status de progresso. Cada modulo mostra: nome, icone, porcentagem de conceitos concluidos, badge "Completo" ou "Em andamento" ou "Bloqueado". Dados de `modules` e `progress` do Supabase
- [ ] AC5: Secao "Profecia do Dia" exibe uma mensagem motivacional tematica Matrix. Mensagens pre-definidas em array (20+ opcoes), selecionada por hash do dia (deterministica, muda todo dia). Estilo: card com borda glow, texto em italico, assinatura "— Koda"
- [ ] AC6: Navegacao lateral (sidebar) ou bottom nav (mobile) com links: Dashboard (ativo), Chat, Progresso, Perfil. Icones SVG customizados no estilo Matrix. Sidebar colapsavel em desktop, bottom nav fixo em mobile
- [ ] AC7: Layout responsivo: grid de 2 colunas em desktop (nivel+streak | modulos), coluna unica em mobile. Breakpoint em `768px`. Code Rain no background (opacidade 0.05)
- [ ] AC8: Loading state com skeleton screens Matrix-themed (blocos pulsando em verde escuro) enquanto dados carregam

#### Technical Notes

- Usar React Server Components para fetch inicial (SSR, sem loading spinner no primeiro render)
- `calculateLevel` e `calculateXP` importados de `@koda/gamification` (funcoes puras, rodam no server)
- Profecia do dia: `prophecies[hashDayOfYear % prophecies.length]` — nao precisa de API call
- Modulos vem da tabela `modules` com join em `progress` filtrado por `user_id`
- O sidebar usa `<nav>` semantico com `aria-current="page"` no link ativo
- Skeleton loading segue o mesmo layout para evitar CLS (Cumulative Layout Shift)

---

### Story 2.5: Interface de Chat

**Complexidade:** L (8 pontos)
**Prioridade:** P1
**Dependencias:** 2.2, 2.3
**Assignee:** @dev

#### Objetivo

Criar a interface de chat para conversar com o Koda via web. A experiencia espelha o WhatsApp: mensagens em baloes, input de texto, historico de conversas, indicador de digitacao, e streaming de respostas. O chat web usa a mesma IA e pipeline do backend, mas com UI rica (formatacao markdown, syntax highlight em blocos de codigo, botoes interativos).

#### Acceptance Criteria

- [ ] AC1: Pagina `/chat` criada com layout de chat full-height: area de mensagens (scroll), input fixo na parte inferior. Background com Code Rain (opacidade 0.03). Header mostra "Koda" com indicador de status (online/pensando)
- [ ] AC2: Componente `ChatMessage` renderiza mensagens do usuario (alinhadas a direita, fundo `matrix-bg-input`) e do Koda (alinhadas a esquerda, fundo `matrix-bg-card`). Mensagens do Koda suportam Markdown (bold, italico, listas, code blocks). Timestamp discreto em cada mensagem
- [ ] AC3: Blocos de codigo nas mensagens do Koda renderizados com syntax highlighting (usar `shiki` ou `prism-react-renderer`). Botao "Copiar" no canto do bloco. Fonte `Fira Code`. Fundo mais escuro que o balao da mensagem
- [ ] AC4: Componente `ChatInput` com textarea auto-expansivel (1 a 5 linhas), botao de envio (icone seta verde), suporte a `Enter` para enviar e `Shift+Enter` para quebra de linha. Desabilitado enquanto aguarda resposta do Koda
- [ ] AC5: Indicador de digitacao ("Koda esta pensando...") exibido enquanto aguarda resposta da API. Animacao de 3 pontos pulsando em verde. Aparece na area de mensagens como ultima mensagem (posicao do Koda)
- [ ] AC6: API Route `/api/chat` criada em `apps/web` que recebe `{ message: string, userId: string }`, processa via pipeline do backend (reutilizando logica de `@koda/core`), e retorna resposta. Suporta streaming via `ReadableStream` para respostas longas
- [ ] AC7: Historico de mensagens carregado do Supabase (tabela `interactions`) ao abrir o chat. Exibe ultimas 50 mensagens. Scroll automatico para a mensagem mais recente. Botao "Carregar mais" no topo para paginacao
- [ ] AC8: Estado do chat gerenciado com Zustand store: `messages[]`, `isLoading`, `sendMessage()`, `loadHistory()`. Mensagens do usuario aparecem instantaneamente (optimistic update), resposta do Koda aparece quando chega

#### Technical Notes

- Streaming usa Server-Sent Events (SSE) ou Vercel AI SDK `useChat` hook
- O pipeline no web precisa de adaptacao: Etapa 9 (Format & Send) nao envia via Evolution API, retorna o texto formatado
- Syntax highlighting com `shiki` (melhor performance, SSR-friendly) sobre `prism`
- Historico usa `interactions` com `order by created_at DESC limit 50 offset N`
- Chat input deve ter `aria-label="Enviar mensagem para o Koda"`
- Mensagens sao salvas via API Route (nao diretamente do client no Supabase)
- Considerar WebSocket para real-time em versao futura — V1 usa polling ou SSE

---

### Story 2.6: Fluxo de Aula (Lesson Flow)

**Complexidade:** L (8 pontos)
**Prioridade:** P1
**Dependencias:** 2.5
**Assignee:** @dev

#### Objetivo

Implementar a experiencia de aula no Web App dentro da interface de chat. Quando Pedro inicia uma aula, o Koda ensina via chat com UI enriquecida: explicacoes com markdown formatado, exercicios com campos de codigo, Portao 1 (compreensao) com area de texto, Portao 2 (pratica) com editor inline, feedback visual de aprovacao/reprovacao, e XP ganho animado. A aula web e mais rica que no WhatsApp.

#### Acceptance Criteria

- [ ] AC1: Quando o estado da FSM e `LESSON`, o chat exibe um header contextual: nome do modulo, conceito atual, icone de progresso (ex: "Modulo 1: Logica de Programacao > Variaveis"). Header fixo abaixo do header principal do chat
- [ ] AC2: Componente `GateCard` para Portao 1 (compreensao): card especial na conversa com titulo "Portao da Compreensao", descricao da tarefa, textarea para resposta do aluno, botao "Enviar Resposta". Borda dourada diferenciando de mensagens normais
- [ ] AC3: Componente `GateCard` para Portao 2 (pratica): card com titulo "Portao da Pratica", descricao do exercicio, editor de codigo inline (Monaco Editor simplificado — 10 linhas, syntax JS/TS), botao "Executar e Enviar". Borda dourada
- [ ] AC4: Feedback de aprovacao no portao: animacao de "PORTAO APROVADO" com efeito glow verde, XP ganho animado (+30 XP ou +50 XP flutuando e sumindo), som opcional (toggle nas configuracoes). Card muda borda para verde solido
- [ ] AC5: Feedback de reprovacao no portao: mensagem encorajadora do Koda inline, card muda borda para `matrix-accent` (vermelho sutil), contador de tentativas visivel ("Tentativa 2/3"). Nao exibe mensagem negativa — tom e "Quase la! Tenta de novo"
- [ ] AC6: Progresso da aula atualizado em tempo real no Supabase: `progress.mastery_level` atualizado apos cada portao aprovado, XP atribuido via `@koda/db`. Dashboard reflete mudancas imediatamente (revalidacao)
- [ ] AC7: Transicao entre estados da aula (LESSON -> GATE_1 -> GATE_2 -> HUB) gerenciada pela FSM existente. O chat detecta o estado retornado pela API e renderiza o componente apropriado (mensagem normal, GateCard tipo 1, GateCard tipo 2)
- [ ] AC8: Ao concluir conceito (todos os portoes aprovados), exibir card de "Conceito Concluido" com resumo: nome do conceito, XP total ganho, tempo investido, proximo conceito sugerido. Botao "Proximo Conceito" e botao "Voltar ao Hub"

#### Technical Notes

- Gate Cards sao componentes especiais renderizados baseado no `state` retornado pela API
- Monaco Editor inline usa `@monaco-editor/react` com configuracao minima (sem minimap, sem line numbers excessivos)
- O feedback de XP usa Framer Motion para animacao de numero flutuando
- A FSM roda no servidor — o frontend apenas interpreta o `newState` da resposta
- Reutilizar `evaluateGate` de `src/modules/lesson/gate-evaluator.ts` via API Route
- Sons sao opcionais e controlados por `localStorage` preference

---

### Story 2.7: Onboarding Web

**Complexidade:** M (5 pontos)
**Prioridade:** P1
**Dependencias:** 2.2, 2.3
**Assignee:** @dev

#### Objetivo

Criar o fluxo de onboarding de 4 etapas para novos usuarios do Web App. Diferente do onboarding WhatsApp (conversacional), o onboarding web e visual: telas com animacoes Matrix, opcoes clicaveis, barra de progresso, e transicoes suaves. Coleta as mesmas informacoes (nome, objetivo, nivel, disponibilidade) mas com UX rica.

#### Acceptance Criteria

- [ ] AC1: Pagina `/onboarding` renderizada automaticamente apos primeiro login se `user.onboarding_completed === false`. Middleware redireciona `/dashboard` para `/onboarding` nesse caso
- [ ] AC2: Layout de onboarding: fundo escuro com Code Rain animado (opacidade 0.1), card central (max-width 480px), barra de progresso no topo (4 etapas, verde conforme avanca), botoes "Voltar" e "Proximo" na parte inferior
- [ ] AC3: **Etapa 1 — Boas-vindas**: animacao de texto digitando "Bem-vindo ao Koda", subtitulo "Seu professor de programacao com IA", campo de input para nome do aluno. Validacao: nome nao vazio, minimo 2 caracteres
- [ ] AC4: **Etapa 2 — Objetivo**: titulo "Qual seu objetivo?", 3 cards clicaveis: "Aprender do zero" (icone foguete), "Mudar de carreira" (icone briefcase), "Criar meu SaaS" (icone codigo). Card selecionado recebe borda verde glow. Mapeamento: `zero_to_dev`, `career_change`, `create_saas`
- [ ] AC5: **Etapa 3 — Nivel**: titulo "Qual seu nivel atual?", 3 cards clicaveis: "Nunca programei" (icone seedling), "Sei um pouco de HTML" (icone code), "Ja sei JavaScript" (icone terminal). Mapeamento: `beginner`, `basic_html`, `knows_js`
- [ ] AC6: **Etapa 4 — Disponibilidade**: titulo "Quanto tempo por dia?", 3 cards clicaveis: "5-10 min" (icone relogio), "15-30 min" (icone calendario), "30+ min" (icone fogo). Mapeamento: `10`, `20`, `45` (minutos)
- [ ] AC7: Ao clicar "Concluir" na etapa 4, dados salvos no Supabase (`updateUserProfile`), campo `onboarding_completed` atualizado para `true`, animacao de transicao (tela escurece, texto "Iniciando sua jornada..." com typing effect), redirect para `/dashboard` apos 2 segundos
- [ ] AC8: Se usuario ja completou onboarding, acesso direto a `/onboarding` redireciona para `/dashboard`. Dados parciais persistidos: se usuario sair no meio do onboarding, ao voltar continua da etapa onde parou (salvo em `conversation_state.context`)

#### Technical Notes

- Onboarding web e independente do onboarding WhatsApp — sao fluxos separados para o mesmo usuario
- Se usuario ja fez onboarding no WhatsApp, `onboarding_completed` ja e `true` e ele pula direto para dashboard
- Animacao de typing usa CSS `@keyframes` com `steps()` — nao precisa de JS
- Cards clicaveis sao radio buttons estilizados semanticamente (`<input type="radio">` hidden + `<label>`)
- Dados parciais salvos via `conversation_state.context.web_onboarding_step`
- Transicoes entre etapas usam Framer Motion `AnimatePresence` para slide horizontal

---

### Story 2.8: Progresso & Conquistas

**Complexidade:** M (5 pontos)
**Prioridade:** P2
**Dependencias:** 2.4
**Assignee:** @dev

#### Objetivo

Criar a pagina de progresso detalhado e conquistas do aluno. Inclui: mapa visual de modulos (estilo jogo RPG), badges desbloqueadas, historico de XP, grafico de atividade, e animacoes de level-up. O Pedro precisa VER sua evolucao de forma visual e gamificada — essa e a dopamina que mantem o engajamento TDAH.

#### Acceptance Criteria

- [ ] AC1: Pagina `/progress` criada com 3 secoes: Mapa de Modulos, Conquistas, Historico de Atividade. Navegacao por tabs ou scroll vertical em mobile
- [ ] AC2: Secao "Mapa de Modulos": grid visual de 30 modulos organizados em 5 fases. Cada modulo e um node circular: verde (completo), verde pulsando (em andamento), cinza (bloqueado). Linhas conectando modulos sequenciais. Fases separadas por divisoria visual. Tooltip ao hover mostra nome e porcentagem
- [ ] AC3: Secao "Conquistas": grid de badges (4 colunas desktop, 2 mobile). Cada badge e um icone circular com nome abaixo. Badges desbloqueadas: coloridas com glow. Badges bloqueadas: cinza com opacidade 0.3 e icone de cadeado. 10 badges iniciais: "Primeiro Login", "Primeira Aula", "Gate 1 Mestre", "Gate 2 Mestre", "Streak 7 dias", "Streak 30 dias", "Nivel 3", "Nivel 5", "100 XP em 1 dia", "Conceito Perfeito (sem errar)"
- [ ] AC4: Animacao de level-up: quando usuario acessa a pagina e subiu de nivel desde a ultima visita, exibir overlay fullscreen com animacao de particulas verdes, novo nivel grande no centro com glow, titulo do nivel, e som (se ativo). Dura 3 segundos e fecha automaticamente
- [ ] AC5: Secao "Historico de Atividade": grafico tipo GitHub contribution grid (heatmap) dos ultimos 90 dias. Cada celula representa 1 dia: sem atividade (cinza), atividade leve (verde escuro), atividade media (verde), atividade intensa (verde brilhante). Dados de `sessions` agrupados por dia
- [ ] AC6: Streak display proeminente no topo: numero grande de dias, icone de fogo animado se streak > 0, recorde pessoal (max_streak) ao lado. Se streak = 0, mensagem "Faca sua primeira sessao hoje!"
- [ ] AC7: Estatisticas gerais exibidas em cards: "Total de XP", "Conceitos dominados", "Horas de estudo", "Modulos completos". Cada card com icone, numero grande e label. Dados calculados a partir de `progress`, `sessions`, `users`

#### Technical Notes

- Mapa de modulos usa CSS Grid ou SVG para layout dos nodes
- Contribution grid pode usar biblioteca `react-activity-calendar` ou implementar com CSS Grid
- Badges sao definidas em constante no frontend — nao precisa de tabela no banco (V1)
- O check de "subiu de nivel" compara `level` do user com `localStorage.lastSeenLevel`
- Animacao de level-up usa Framer Motion `motion.div` com variantes
- Dados do heatmap: query SQL `SELECT date_trunc('day', started_at) as day, count(*) FROM sessions WHERE user_id = ? GROUP BY day`

---

### Story 2.9: Editor de Codigo (Monaco)

**Complexidade:** L (8 pontos)
**Prioridade:** P2
**Dependencias:** 2.5, 2.6
**Assignee:** @dev

#### Objetivo

Integrar o Monaco Editor como playground de codigo no Web App. O aluno pode escrever, editar e executar codigo JavaScript diretamente no browser, com syntax highlighting, autocompletar basico, feedback de erros em tempo real, e output visivel. O playground e acessivel via chat (exercicios) e via pagina dedicada para pratica livre.

#### Acceptance Criteria

- [ ] AC1: Pagina `/playground` criada com layout de 2 paineis: editor (esquerda/topo) e output (direita/baixo). Resizavel via drag. Mobile: paineis empilhados verticalmente com toggle
- [ ] AC2: Monaco Editor integrado com `@monaco-editor/react`, tema customizado Matrix (fundo `#0D0D0D`, texto verde, keywords em ciano, strings em dourado, comentarios dim). Fonte `Fira Code` com ligatures ativadas
- [ ] AC3: Editor configurado para JavaScript/TypeScript com: syntax highlighting, bracket matching, auto-indent, line numbers, minimap desativado em mobile (ativo em desktop), word wrap ativado
- [ ] AC4: Botao "Executar" (icone play verde) acima do editor que executa o codigo em sandbox seguro. Execucao via `eval()` dentro de Web Worker isolado com timeout de 5 segundos. `console.log` interceptado e redirecionado para o painel de output
- [ ] AC5: Painel de output exibe resultado da execucao: `console.log` em verde, erros em `matrix-accent` (vermelho), warnings em `matrix-gold`. Cada linha com timestamp. Botao "Limpar Output". Scroll automatico para ultima linha
- [ ] AC6: Se codigo tem erro de sintaxe, Monaco exibe squiggly underline vermelha no editor. Erro tambem aparece no painel de output com numero da linha e descricao
- [ ] AC7: Botao "Resetar" limpa o editor e output. Botao "Copiar Codigo" copia conteudo do editor para clipboard. Botao "Tela Cheia" expande playground para fullscreen
- [ ] AC8: Exercicios do chat (Story 2.6) abrem o playground pre-carregado com template do exercicio (codigo parcial com `// TODO: complete aqui`). Resultado do exercicio enviado de volta para o chat via callback

#### Technical Notes

- Monaco Editor e pesado (~2MB) — carregar com `next/dynamic` e `ssr: false`
- Web Worker para execucao segura: nao deve ter acesso a DOM, fetch, ou filesystem
- Tema customizado Matrix registrado via `monaco.editor.defineTheme` antes de montar o editor
- O sandbox de execucao intercepta `console.log/warn/error` com proxy
- Em mobile, minimap e parameter hints desativados para performance
- Template de exercicio passado via query param ou Zustand store: `/playground?exercise=variaveis-1`
- Considerar `sandpack` como alternativa ao eval se precisar de React/JSX no futuro

---

### Story 2.10: Perfil & Configuracoes

**Complexidade:** S (5 pontos)
**Prioridade:** P2
**Dependencias:** 2.3, 2.4
**Assignee:** @dev

#### Objetivo

Criar a pagina de perfil e configuracoes do usuario. Pedro pode ver e editar suas informacoes, visualizar historico de niveis, ajustar preferencias do tema (Code Rain on/off, sons), e gerenciar sua conta. A pagina de perfil e o espaco do aluno para se sentir dono da sua jornada.

#### Acceptance Criteria

- [ ] AC1: Pagina `/profile` criada com 3 secoes: Informacoes Pessoais, Historico de Nivel, Configuracoes. Layout em card unico com tabs ou accordion
- [ ] AC2: Secao "Informacoes Pessoais": exibe nome (editavel), email (read-only), objetivo (editavel via select), nivel atual (read-only), data de cadastro. Botao "Salvar Alteracoes" que atualiza `public.users` via Supabase. Feedback visual de sucesso (toast verde)
- [ ] AC3: Avatar gerado automaticamente: iniciais do nome em circulo com fundo `matrix-green`, ou Gravatar se email tem imagem associada. Sem upload de foto (V1)
- [ ] AC4: Secao "Historico de Nivel": timeline vertical mostrando cada level-up do usuario. Cada item: data, nivel alcancado, titulo, XP no momento. Dados da tabela `gamification` filtrados por `type = 'level_up'`. Ordenado do mais recente para o mais antigo
- [ ] AC5: Secao "Configuracoes": toggles para: "Code Rain no fundo" (default: on), "Sons de notificacao" (default: off), "Animacoes reduzidas" (default: off — respeita `prefers-reduced-motion`). Preferencias salvas em `localStorage` e aplicadas globalmente
- [ ] AC6: Botao "Sair" (logout) proeminente na parte inferior da pagina. Confirma com dialog: "Tem certeza que quer sair?". Ao confirmar, chama `signOut()` e redireciona para `/login`
- [ ] AC7: Secao "Estatisticas": resumo compacto do aluno — total de sessoes, horas de estudo, conceitos dominados, melhor streak. Dados agregados de `sessions`, `progress`, `users`
- [ ] AC8: Layout responsivo: card centralizado (max-width 640px) em desktop, full-width em mobile. Todos os campos acessiveis com teclado (tab order logico)

#### Technical Notes

- Preferencias de tema aplicadas via React Context (`ThemeContext`) que le `localStorage` no mount
- `prefers-reduced-motion` detectado com `window.matchMedia` e atualizado dinamicamente
- Timeline de nivel usa `<ol>` semantico com `role="list"`
- Toast de sucesso pode usar biblioteca leve como `sonner` ou implementar custom com Framer Motion
- Gravatar URL: `https://www.gravatar.com/avatar/{md5(email)}?d=blank&s=80`
- Logout limpa Supabase session + localStorage preferences

---

## Ordem de Prioridade

| Prioridade | Stories | Justificativa |
|-----------|---------|---------------|
| **P0 — Fundacao** | 2.1, 2.2, 2.3 | Sem isso, nenhuma outra story funciona. Monorepo, design system e auth sao pre-requisitos |
| **P1 — Core** | 2.4, 2.5, 2.6, 2.7 | Experiencia principal: dashboard, chat com Koda, aulas, onboarding |
| **P2 — Engajamento** | 2.8, 2.9, 2.10 | Gamificacao visual, playground de codigo, perfil. Enriquecem a experiencia |

## Grafo de Dependencias

```
2.1 (Monorepo) ──┬──▶ 2.2 (Design System) ──┬──▶ 2.4 (Dashboard) ──▶ 2.8 (Progresso)
                  │                            │                         │
                  │                            ├──▶ 2.5 (Chat) ─────────┼──▶ 2.9 (Editor)
                  │                            │                         │
                  │                            ├──▶ 2.7 (Onboarding)    │
                  │                            │                         │
                  └──▶ 2.3 (Auth) ────────────┼──▶ 2.6 (Lesson Flow)   │
                                               │                         │
                                               └──▶ 2.10 (Perfil) ◀────┘
```

## Estimativa Total

| Story | Complexidade | Pontos |
|-------|-------------|--------|
| 2.1 — Monorepo & Scaffold | L | 8 |
| 2.2 — Design System | M | 5 |
| 2.3 — Autenticacao | M | 5 |
| 2.4 — Dashboard / Hub | M | 5 |
| 2.5 — Chat Interface | L | 8 |
| 2.6 — Lesson Flow | L | 8 |
| 2.7 — Onboarding Web | M | 5 |
| 2.8 — Progresso & Conquistas | M | 5 |
| 2.9 — Editor de Codigo | L | 8 |
| 2.10 — Perfil & Configuracoes | S | 5 |
| **TOTAL** | | **62 pontos** |

## Modulos do Epic 1 Reutilizados

| Modulo Epic 1 | Localizacao Atual | Destino no Monorepo | Usado em |
|---------------|-------------------|---------------------|----------|
| `xp-calculator.ts` | `src/modules/gamification/` | `packages/gamification` | 2.4, 2.6, 2.8 |
| `streak-tracker.ts` | `src/modules/gamification/` | `packages/gamification` | 2.4, 2.8 |
| `progress-display.ts` | `src/modules/gamification/` | `packages/gamification` | 2.4, 2.8 |
| `schema.ts` (tipos) | `src/db/schema.ts` | `packages/core` | Todas as stories |
| `state-machine.ts` | `src/core/state-machine.ts` | `packages/core` | 2.5, 2.6 |
| `classifier.ts` | `src/core/classifier.ts` | `apps/api` (nao compartilhado) | 2.5, 2.6 |
| `context-builder.ts` | `src/core/context-builder.ts` | `apps/api` (nao compartilhado) | 2.5, 2.6 |
| `gate-evaluator.ts` | `src/modules/lesson/` | `apps/api` (nao compartilhado) | 2.6 |
| Queries Supabase | `src/db/queries/` | `packages/db` | 2.3, 2.4, 2.5, 2.6, 2.8, 2.10 |

## Notas Finais

- O Web App e um complemento ao WhatsApp, nao um substituto. O WhatsApp continua sendo o canal principal de ensino
- O design Matrix deve ser acessivel — contraste 4.5:1 minimo, `prefers-reduced-motion` respeitado
- Mobile-first: toda UI projetada para 320px primeiro, expandida para desktop depois
- Supabase Auth unifica a identidade entre WhatsApp (phone) e Web (email). Vincular contas e escopo futuro (Epic 3)
- O Pedro vai usar o Web App principalmente para: ver progresso, praticar codigo no playground, e acessar o chat quando nao estiver no celular
