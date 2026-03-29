# Koda — Product Requirements Document (PRD)

**Versao:** 2.0
**Data:** 29 de marco de 2026
**Autor:** Morgan (@pm), com base nos documentos de arquitetura de Aria (@architect)
**Status:** Aprovado — baseado em arquitetura validada
**Founder:** Pedro Caetano

---

## Changelog

| Data | Versao | Descricao | Autor |
|------|--------|-----------|-------|
| 29-Mar-2026 | 1.0 | Draft inicial baseado no Project Brief v1.0 | Pedro Caetano |
| 29-Mar-2026 | 2.0 | Reescrita completa — stack corrigida, anti-dropout, gamificacao, founder-first | Morgan (@pm) |

---

## 1. Visao do Produto

### One-liner

Professor de programacao por IA que ensina do zero ao SaaS, acessivel via WhatsApp e Web App, desenhado para cerebros inquietos (TDAH-friendly).

### Problema

A educacao de programacao no Brasil enfrenta um paradoxo:
- Ha demanda crescente por talento tech (falta de 500k+ devs)
- Cursos tradicionais tem **desistencia > 70%** (longos, caros, genericos)
- Para cerebros TDAH, e pior: hiperfoco inicial gera animacao, rotina faz dopamina cair, abandono gera culpa, e o aluno nao volta mais
- Plataformas existentes (Alura, Udemy, Rocketseat) criam friccao: exigem computador, sessoes longas, formato repetitivo

### Solucao

Koda e um professor de programacao por IA que:
- Ensina via **WhatsApp** (menor friccao possivel — 130M brasileiros usam diariamente)
- Complementa com **Web App** (dashboard visual, playground de codigo, mapa gamificado)
- Foi **desenhado para TDAH** com 7 mecanismos anti-abandono integrados ao sistema
- Usa **3 portoes de progressao** que exigem demonstracao real de aprendizado
- Oferece **gamificacao profunda** (XP, streaks, badges, niveis, mapa visual tipo jogo)
- Segue o **curriculo Zero-a-SaaS** em 30 modulos / 5 fases / 6-8 meses

### Principio Arquitetural

```
NAO E O ALUNO QUE PRECISA TER DISCIPLINA.
E O SISTEMA QUE PRECISA SER IMPOSSIVEL DE ABANDONAR.
```

Anti-abandono nao e uma feature — e uma propriedade do sistema inteiro.

---

## 2. Publico-Alvo

### Aluno #1: Pedro Caetano (Founder-First Strategy)

Pedro e simultaneamente o founder do Koda e seu primeiro aluno. Ele:
- Tem TDAH e precisa dos mecanismos anti-abandono para si mesmo
- Nao sabe programar ainda — e o publico-alvo do proprio produto
- Vai aprender programacao USANDO o Koda

**Ciclo Virtuoso Build-Learn-Improve:**

| Fase | Pedro faz | Pedro aprende |
|------|-----------|---------------|
| Fase 1 (agora) | IA constroi o Koda | Fundamentos (logica, HTML, CSS) |
| Fase 2 (mes 2-3) | Entende HTML/CSS/JS | Comeca a LER o codigo do Koda |
| Fase 3 (mes 4-5) | Entende TS/APIs/banco | Comeca a MODIFICAR o Koda |
| Fase 4 (mes 6-8) | Entende fullstack | CONSTROI features no Koda |
| Fase 5 (mes 8+) | E programador | Cria OUTROS SaaS |

**O Koda e o veiculo, nao o destino.** O destino e Pedro ter autonomia para criar qualquer produto digital.

### Publico Primario

- 18-35 anos, Brasil
- Quer aprender programacao para mudar de carreira ou criar SaaS
- Tem TDAH ou dificuldade de foco em formatos tradicionais
- Usa WhatsApp diariamente
- Prefere celular a computador
- Nao tem paciencia para videos longos

### Publico Secundario

- Desenvolvedores iniciantes querendo chegar a fullstack
- Empreendedores querendo entender tech para criar produtos

---

## 3. Stack Tecnologica

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| **WhatsApp** | Evolution API v2 (self-hosted na VPS) | Ja rodando, sem custo mensal, controle total |
| **Backend** | Hono (TypeScript) | Leve, TypeScript-first, Web Standard APIs, facil portar para Edge |
| **Runtime** | Node.js 20+ | Compatibilidade com Evolution API e ecossistema |
| **Banco de Dados** | Supabase (Postgres + pgvector + RLS + Auth) | Auth, RLS, realtime, embeddings futuros |
| **IA Principal** | Claude Sonnet 4 | Melhor para educacao, empatia, explicacoes detalhadas |
| **IA Classificador** | Claude Haiku 4.5 | Rapido e barato para classificar intencao (14 intents) |
| **Audio** | Whisper (OpenAI) | Transcrever audios de voz do aluno |
| **Web App** | Next.js 16 (App Router) | Dashboard, playground, mapa visual gamificado |
| **Hosting Web** | Vercel | Zero-config para Next.js, CDN global |
| **Hosting Backend** | VPS existente | Evolution API + Hono na mesma VPS |

### Decisoes Arquiteturais Chave (ADRs)

| ADR | Decisao | Consequencia |
|-----|---------|-------------|
| ADR-001 | Hono em vez de Express | Mais leve, TypeScript-first, portavel para Edge/Cloudflare |
| ADR-002 | Evolution API em vez de Twilio | Self-hosted, custo zero, flexibilidade total |
| ADR-003 | Claude unico (sem GPT fallback) | Simplifica arquitetura; se Claude cair, bot fica offline (aceitavel no MVP) |
| ADR-004 | Web App acessa Supabase direto | Mais simples, menos latencia; RLS garante seguranca |
| ADR-005 | Curriculo em YAML, nao no banco | Facil de versionar, editar, fazer PR; cache em memoria |
| ADR-006 | Structured Output do Claude | Cada resposta inclui JSON com decisoes + texto; post-processing automatico |

---

## 4. Requisitos Funcionais

### FR1: Pipeline de Processamento de Mensagem (10 Etapas)

Toda mensagem passa por um pipeline de 10 etapas:

| Etapa | Modulo | Funcao | SLA |
|-------|--------|--------|-----|
| 1 | Receive & Parse | Extrair phone, text, type (text/audio/image). Audio → Whisper | < 50ms |
| 2 | Identify User | Buscar usuario no Supabase. Se nao existe → criar | < 100ms |
| 3 | Rate Limit | < 10 msgs/min por usuario. Excedeu → "Calma, estou processando" | < 10ms |
| 4 | Classify Intent | Claude Haiku classifica intencao (14 intents) | 200-500ms |
| 5 | State Machine | Verificar estado atual e decidir transicao (FSM) | < 10ms |
| 6 | Build Context | Montar prompt em 6 camadas (personalidade + modo + perfil + curriculo + historico + output) | < 200ms |
| 7 | AI Engine | Claude Sonnet gera resposta. Timeout 15s com fallback | 2-8s |
| 8 | Post-Process | Extrair decisoes, atualizar progresso, calcular XP, verificar badges | < 100ms |
| 9 | Format & Send | Formatar para WhatsApp (bold, code, emoji). Quebrar em < 2000 chars. Enviar via Evolution | < 200ms |
| 10 | Log & Update | Salvar interacao, sessao, progresso, gamificacao no Supabase | < 200ms |

**Tempo total esperado: 3-10 segundos (SLA < 15s)**

### FR2: Intent Classifier (14 Intencoes)

| Intent | Descricao | Exemplo |
|--------|-----------|---------|
| `greeting` | Saudacao | "Oi", "Bom dia" |
| `onboarding_response` | Resposta a pergunta de onboarding | "Quero aprender do zero" |
| `lesson_continue` | Quer continuar aula | "Vamos la", "Proximo" |
| `lesson_explain_again` | Nao entendeu | "Nao entendi", "Repete?" |
| `code_submission` | Enviou codigo | `function soma(a, b) {...}` |
| `exercise_answer` | Resposta textual a exercicio | "A resposta e 42" |
| `gate_response` | Explicacao com proprias palavras | "Entao, uma variavel e tipo..." |
| `doubt` | Pergunta sobre programacao | "O que e API?" |
| `progress_check` | Quer ver progresso | "Como estou?" |
| `mood_check` | Indicador de humor/energia | "To focado", "Cansei" |
| `quiz_answer` | Resposta a quiz | "Alternativa B" |
| `off_topic` | Fora do escopo | "Qual a capital da Franca?" |
| `audio` | Mensagem de audio | (audio file) |
| `image` | Imagem/screenshot | (image file) |

**Custo estimado por classificacao:** ~$0.001 (Haiku)

### FR3: State Machine (Conversation FSM)

| Estado | Descricao |
|--------|-----------|
| IDLE | Usuario inativo |
| ONBOARDING_1..4 | 4 etapas sequenciais de onboarding |
| HUB | Menu principal — mood selector |
| LESSON_EXPLAIN | Explicacao de conceito |
| GATE_1 | Portao de compreensao |
| GATE_2 | Portao de pratica |
| GATE_3 | Portao de aplicacao |
| QUIZ | Quiz relampago |
| DOUBT | Modo duvida livre |
| BREAK | Pausa (aluno cansou) |

**Transicoes principais:**

- IDLE → ONBOARDING_1 (usuario novo) ou HUB (usuario existente)
- ONBOARDING_4 → HUB (onboarding completo)
- HUB → LESSON_EXPLAIN (focado) | QUIZ (quero jogar) | DOUBT (duvida) | BREAK (cansei)
- LESSON_EXPLAIN → GATE_1 → GATE_2 → GATE_3 → HUB (conceito dominado)
- GATE_1 reprovado → LESSON_EXPLAIN (re-explicar com analogia diferente)
- GATE_2 errado → GATE_2 (max 3 tentativas, depois mostra solucao)

### FR4: Onboarding Inteligente (4 Perguntas)

Sequencia de 4 perguntas ao primeiro contato:
1. **Objetivo:** "Aprender do zero" | "Mudar de carreira" | "Criar SaaS"
2. **Nivel:** "Nunca programei" | "Fiz HTML basico" | "Sei JavaScript"
3. **Disponibilidade:** Minutos por dia
4. **Nome:** Como quer ser chamado

Armazena perfil completo no Supabase e gera roadmap personalizado.

### FR5: Sistema de 3 Portoes por Conceito

Koda NAO aceita "entendi" como progresso. O aluno precisa DEMONSTRAR:

**Portao 1 — Compreensao:**
- Koda explica com analogia e exemplo
- Pede: "Me explica com suas palavras"
- Claude avalia com criterios pre-definidos
- Aprovado: mencionou pontos-chave com proprias palavras

**Portao 2 — Pratica:**
- Exercicio de codigo com criterios de validacao
- Ate 3 tentativas com feedback progressivo
- Se nao conseguir em 3x: mostra solucao e marca "completou com ajuda"

**Portao 3 — Aplicacao:**
- Mini-desafio que combina conceito novo + anteriores
- Forca o aluno a pensar, nao copiar
- Claude avalia criatividade + correcao

**Niveis de dominio:**

| Nivel | Indicador | Significado |
|-------|-----------|-------------|
| learning | Vermelho | Ainda nao passou portao 1 |
| practiced | Amarelo | Passou portoes 1 e 2 |
| mastered | Verde | Passou todos os 3 portoes |
| reviewed | Estrela | Revisou apos 7+ dias e lembrava |

**Regras de progressao:**
- So avanca se conceito atual esta "practiced" ou "mastered"
- So avanca de MODULO se 80% dos conceitos estao "mastered"
- Se volta apos 7+ dias: revisao relampago antes de avancar
- Spaced repetition: conceitos "practiced" reaparecem como aquecimento

### FR6: 7 Mecanismos Anti-Abandono (TDAH-Proof)

#### 1. Micro-Completude (Nunca sair sem vitoria)
- TODA interacao gera XP, mesmo "cansei" (+15 XP "Honestidade e XP tambem")
- O sistema NUNCA termina sessao sem dar XP
- Minimo garantido: 5 XP por sessao

#### 2. Formato Nunca Repete (Anti-monotonia algoritmico)
8 formatos disponiveis:
- Quiz relampago (30s por pergunta)
- Desafio de codigo
- Ache o bug (puzzle de debugging)
- Ordene as linhas (quebra-cabeca logico)
- Boss fight (junta 3+ conceitos)
- Revisao aleatoria
- "O que esse codigo faz?" (leitura)
- Speed coding (resolva em 2 min)

Regras: nunca repete os ultimos 2 formatos, adapta ao humor, 20% chance de formato surpresa.

#### 3. Re-Engajamento Proativo (O Koda vem ate voce)
Cascata progressiva de mensagens via WhatsApp:
- Dia 2: mensagem leve ("Quiz de 30s?")
- Dia 3: apelo a perda ("Streak em risco!")
- Dia 5: curiosidade ("2 conceitos para desbloquear Ilha JS")
- Dia 7: desafio direto (envia ache-o-bug)
- Dia 14: empatia ("Tudo bem sumir. Progresso salvo.")
- Dia 30: ultimo toque ("Faz 1 mes! Tem novidades")
- Depois: silencio (respeita a decisao do aluno)

Regras: NUNCA mais de 1 msg/dia, NUNCA culpar, SEMPRE oferecer algo facil.

#### 4. Zero Culpa (Re-entry sem friccao)
- Quando volta, o sistema COMEMORA
- NUNCA menciona quanto tempo ficou fora de forma negativa
- Streaks quebrados NAO sao mencionados; novo streak comeca imediatamente
- Progresso, badges e XP NUNCA sao perdidos
- "Streak de volta" bonus: +20 XP extra por voltar

#### 5. Dificuldade Adaptativa (Nunca frustra, nunca entedia)
Avaliacao a CADA interacao baseada em sinais:
- Muito facil: responde < 10s, 5 acertos seguidos → aumentar dificuldade
- Muito dificil: 3 erros seguidos, msgs frustradas → baixar, mudar abordagem
- No flow: respostas em 30s-3min, mix de acertos → manter ritmo

#### 6. Progresso Sempre Visivel (Dopamina visual)
Progresso mostrado proativamente em 3 momentos:
- Apos cada micro-vitoria (inline na conversa com barra de progresso)
- Ao final de cada sessao (summary com XP, streak, proximos milestones)
- Semanalmente (relatorio motivacional com estatisticas)

#### 7. Compromisso Minimo de 30 Segundos
- O compromisso minimo e 30 SEGUNDOS, nao 5 minutos
- Quiz de 1 pergunta mantem o streak ("Streak protection")
- O sistema NUNCA exige sessao minima > 30 segundos
- 60% das vezes o aluno continua alem dos 30s

### FR7: Gamificacao

#### Sistema de XP

| Acao | XP |
|------|----|
| Portao 1 aprovado | +30 |
| Portao 2 aprovado | +50 |
| Portao 2 com ajuda | +25 |
| Portao 3 aprovado | +100 |
| Quiz correto | +20 |
| Ache-o-bug resolvido | +40 |
| Speed coding < 2min | +60 |
| Revisao apos 7 dias | +30 |
| Streak bonus 7 dias | +100 |
| Streak bonus 30 dias | +500 |
| Abriu o Koda hoje | +5 |
| Respondeu 1 pergunta | +10 |
| Disse "cansei" (honestidade) | +15 |

#### Niveis

| Nivel | XP | Titulo |
|-------|-----|--------|
| 1 | 0 | Curioso |
| 2 | 200 | Aprendiz |
| 3 | 500 | Praticante |
| 4 | 1000 | Codador |
| 5 | 2000 | Developer |
| 6 | 4000 | Fullstack |
| 7 | 7000 | Arquiteto |
| 8 | 10000 | Mestre Koda |

#### Badges

| Badge | Criterio |
|-------|---------|
| Primeiro Codigo | Completar primeiro exercicio |
| Streak 7 | 7 dias seguidos |
| Streak 30 | 30 dias seguidos |
| Bug Hunter | 10 ache-o-bug resolvidos |
| Speed Demon | 5 speed codings < 2min |
| Ilha Completa | Todos conceitos mastered em 1 modulo |
| Fase Completa | Todos modulos de 1 fase |
| Revisao Mestre | 20 conceitos revisados apos 7 dias |
| Madrugador | Estudar antes das 7h |
| Noturno | Estudar depois das 23h |

### FR8: System Prompts (6 Camadas)

Cada chamada ao Claude Sonnet monta o prompt em camadas:

| Camada | Conteudo |
|--------|----------|
| Layer 1: Base Personality | Personalidade Koda, tom, regras gerais, limitacoes |
| Layer 2: Mode-Specific | Prompt do modo ativo (onboarding/lesson/exercise/gate/quiz/doubt) |
| Layer 3: Student Profile | Nome, nivel, objetivo, humor, pontos fortes/fracos |
| Layer 4: Curriculum Context | Modulo atual, conceito, prerequisitos, conteudo didatico, exercicio |
| Layer 5: Conversation History | Ultimas 10 mensagens, resumo de sessoes anteriores |
| Layer 6: Output Instructions | Formato de resposta (JSON structured output + texto), limites de caracteres |

**Structured Output:** Cada resposta do Claude retorna JSON com decisoes (gate_passed, xp_earned, next_state, mastery_update, format_suggestion) + texto para o aluno.

### FR9: Web App (Next.js 16)

| Rota | Tipo | Descricao |
|------|------|-----------|
| `/` | Publica | Landing page + login |
| `/dashboard` | Protegida | Stats, streak, XP, progresso geral |
| `/roadmap` | Protegida | Mapa visual tipo jogo (ilhas, montanhas) |
| `/playground` | Protegida | Code editor no browser (Monaco) |
| `/badges` | Protegida | Conquistas e colecao de badges |
| `/settings` | Protegida | Configuracoes do perfil |

**Autenticacao:** Supabase Auth com magic link via WhatsApp (OTP enviado via Evolution API).

**Comunicacao com dados:** Web App acessa Supabase diretamente (anon key + RLS), sem passar pelo Hono. RLS garante seguranca.

**Mapa Visual (Roadmap Gamificado):** Componente React interativo (Canvas/SVG) onde cada "ilha" representa um modulo. Ilhas sao desbloqueadas conforme o aluno avanca. Conceitos aparecem como nodes clicaveis dentro de cada ilha. Progresso sincronizado em real-time via Supabase Realtime.

```
Ilha HTML → Monte CSS → Vulcao JavaScript → Castelo TypeScript
                                                    |
                                          Mar do Backend → Cidade React → Base SaaS → LANCAMENTO
```

### FR10: Modo Duvida Rapida

- Aluno pode perguntar qualquer coisa sobre programacao a qualquer momento
- Nao interrompe fluxo de aula (DOUBT empilha estado anterior via context_stack)
- Resposta adaptada ao nivel do aluno
- Apos responder, volta ao estado anterior

### FR11: Audio (Whisper)

- Aluno envia audio → Whisper transcreve → texto entra no pipeline normal
- Aluno pode explicar por voz (util para Portao 1 — compreensao)
- Suporte a portugues brasileiro

### FR12: Dropout Risk Score (Modelo Preditivo)

Score calculado diariamente para cada usuario (0.0 a 1.0):

| Fator | Peso |
|-------|------|
| Dias sem atividade (>=7 dias) | +0.30 |
| Sessoes encurtando (tendencia) | +0.20 |
| Taxa de acerto caindo | +0.15 |
| Streak quebrado recentemente | +0.10 |
| Formatos se repetindo | +0.10 |
| Nunca passou do modulo 2 (>20 sessoes) | +0.15 |
| Badge recente (ultimos 7 dias) | -0.10 |
| Streak >= 7 dias | -0.15 |

Se risk > 0.5 → acionar re-engajamento proativo
Se risk > 0.8 → alerta no admin dashboard

---

## 5. Requisitos Nao-Funcionais

### NFR1: Performance

| Metrica | Meta |
|---------|------|
| Latencia total (mensagem → resposta) | 3-10s (SLA < 15s) |
| Classificacao de intent (Haiku) | < 1s |
| AI Engine (Sonnet) | < 15s com timeout e fallback |
| Throughput MVP | 1000 mensagens/dia |
| Idle indicator | Enviar "digitando..." enquanto processa |

### NFR2: Disponibilidade

| Metrica | Meta |
|---------|------|
| Uptime | 99.5% (max 3h downtime/mes) |
| Failover Claude | Mensagem de fallback "Voltamos em breve" |
| Evolution API | Health check + restart automatico (PM2) |
| Idempotencia | Dedup por message_id (Evolution envia 2x as vezes) |

### NFR3: Seguranca

| Camada | Implementacao |
|--------|--------------|
| Transporte | HTTPS obrigatorio (Supabase, Evolution, Claude) |
| Webhook | Validar API key do Evolution no header |
| Rate Limiting | 10 msgs/min por usuario, 100 msgs/hora |
| RLS | Supabase Row Level Security em todas tabelas de usuario |
| Auth (Web) | Supabase Auth com magic link/OTP |
| Secrets | Env vars, nunca hardcoded |
| Idempotencia | Dedup por message_id |
| Input Sanitization | Limpar input antes de passar para Claude |
| Prompt Injection | System prompt robusto + guardrails ("NUNCA saia do papel de professor") |

### NFR4: Escalabilidade

| Cenario | Arquitetura |
|---------|-------------|
| MVP (100 alunos) | VPS existente + Supabase free tier + Vercel hobby |
| Growth (500 alunos) | Supabase Pro + monitoramento de custo |
| Scale (1000+ alunos) | Avaliar Edge deploy (Hono portavel para Cloudflare) |

### NFR5: Confiabilidade

- Logging estruturado de todas interacoes no Supabase
- Error handling com Sentry (alertas se taxa > 1%)
- Idempotencia de webhooks
- Backups automaticos (Supabase gerencia)

### NFR6: Usabilidade

- Portugues brasileiro, tom amigavel e encorajador
- Respostas < 2000 caracteres (limite pratico do WhatsApp)
- Sem jargao desnecessario
- Feedback sempre positivo/construtivo (nunca "INCORRETO")
- Emojis contextuais para reforco visual

---

## 6. Curriculo: Zero a SaaS (30 Modulos, 5 Fases)

### Fase 1 — Fundamentos (Semanas 1-6)

| # | Modulo | Conceitos | Conexao com o Koda |
|---|--------|-----------|--------------------|
| 1 | Logica de programacao | Variaveis, condicoes, loops, algoritmos | "O XP do aluno e uma variavel. O loop roda para cada conceito" |
| 2 | HTML | Tags, semantica, formularios | "A landing page do Koda e feita de HTML" |
| 3 | CSS | Seletores, flexbox, grid, responsivo | "O dashboard do Koda usa CSS para ficar bonito" |
| 4 | Git & GitHub | Commits, branches, PRs | "O codigo do Koda esta no GitHub" |
| 5 | Terminal | Navegacao, comandos, scripts | "Para rodar o Koda: npm run dev" |
| 6 | Como a web funciona | HTTP, DNS, cliente/servidor, APIs | "Quando voce manda msg, uma API recebe" |

### Fase 2 — JavaScript & TypeScript (Semanas 7-12)

| # | Modulo | Conceitos | Conexao com o Koda |
|---|--------|-----------|--------------------|
| 7 | JS Fundamentos | Tipos, funcoes, arrays, objetos | "A lista de badges do Koda e um array" |
| 8 | JS Intermediario | DOM, eventos, fetch | "O botao do playground chama fetch" |
| 9 | JS Avancado | Async/await, promises, closures | "Quando o Koda manda msg pro Claude, e um await" |
| 10 | TypeScript | Tipos, interfaces, generics | "Interface User tem phone, name, level..." |
| 11 | Projeto: App interativo | Aplicacao real no browser | "Mini-versao do quiz do Koda" |

### Fase 3 — Backend (Semanas 13-20)

| # | Modulo | Conceitos | Conexao com o Koda |
|---|--------|-----------|--------------------|
| 12 | Node.js | Runtime, npm, modulos, event loop | "O backend do Koda roda em Node.js" |
| 13 | API REST | Rotas, HTTP methods, middleware | "POST /webhook/evolution recebe suas mensagens" |
| 14 | Banco de Dados | SQL, Postgres, queries, joins | "SELECT * FROM progress WHERE user_id = 'voce'" |
| 15 | ORM | Prisma ou Drizzle, migrations | "O Koda usa Supabase client para queries tipadas" |
| 16 | Autenticacao | JWT, sessions, OAuth | "Quando voce loga no web app, e assim que funciona" |
| 17 | Projeto: API completa | API com auth, CRUD, banco | "API que funciona igual ao Koda" |

### Fase 4 — Frontend Moderno (Semanas 21-28)

| # | Modulo | Conceitos | Conexao com o Koda |
|---|--------|-----------|--------------------|
| 18 | React | Componentes, state, hooks | "O mapa visual e um componente React" |
| 19 | Next.js | App Router, SSR, Server Components | "O web app do Koda e Next.js" |
| 20 | Tailwind CSS | Utility-first, design system | "Classes CSS do Koda sao Tailwind: bg-zinc-900" |
| 21 | Formularios | Validacao, React Hook Form, Zod | "Formulario de onboarding usa RHF + Zod" |
| 22 | Projeto: App full-stack | Next.js + API + banco | "Dashboard do Koda do zero" |

### Fase 5 — Construindo SEU SaaS (Semanas 29-36)

| # | Modulo | Conceitos | Conexao com o Koda |
|---|--------|-----------|--------------------|
| 23 | Arquitetura SaaS | Multi-tenant, planos, billing | "O Koda tem planos Free/Basic/Pro" |
| 24 | Supabase | Auth + DB + storage + RLS | "Voce vai usar RLS no SEU produto" |
| 25 | Stripe | Checkout, assinaturas, webhooks | "Qualquer SaaS precisa de pagamento" |
| 26 | Email transacional | Resend, templates | "Notificacoes e onboarding por email" |
| 27 | Landing page + SEO | Marketing, conversao | "Qualquer produto precisa de landing" |
| 28 | Dashboard admin | Metricas, gestao | "Todo SaaS precisa de dashboard" |
| 29 | IA no SaaS | AI SDK, Claude API | "IA e o diferencial de 2026" |
| 30 | PROJETO FINAL | SEU SaaS do zero ao deploy | "Nao e o Koda. E a SUA ideia." |

### Metricas do Curriculo

| Metrica | Valor |
|---------|-------|
| Total de modulos | 30 |
| Total de conceitos (~5/modulo) | 150 |
| Total de exercicios (~4/modulo) | 120 |
| Mini-projetos | 30 |
| Projetos maiores (1/fase) | 5 |
| Duracao estimada | 6-8 meses |

---

## 7. User Flows

### Flow 1: Primeiro Contato (Onboarding)

```
Aluno → "Oi" → Koda se apresenta →
Pergunta 1 (objetivo) → Resposta →
Pergunta 2 (nivel) → Resposta →
Pergunta 3 (disponibilidade) → Resposta →
Pergunta 4 (nome) → Resposta →
"Seu roadmap esta pronto! Vamos comecar?" →
Primeira aula: Logica de Programacao
```

### Flow 2: Sessao de Estudo (Aula Completa)

```
Aluno → "Vamos la" (mood: focado) →
HUB → LESSON_EXPLAIN (Koda explica conceito com analogia) →
GATE_1 ("Me explica com suas palavras") →
  Se aprovado → GATE_2 (exercicio de codigo) →
    Se acertou → GATE_3 (desafio combinado) →
      Se acertou → HUB (+XP, badge check, progress bar) →
        "Conceito dominado! Proximo?"
    Se errou (ate 3x) → Feedback progressivo → Tenta de novo
  Se nao compreendeu → Re-explicacao com outra analogia → GATE_1 novamente
```

### Flow 3: Sessao de 30 Segundos (Dia Ruim)

```
Aluno → "Cansei" →
Koda: "Tudo bem! Quiz de 1 pergunta?" →
Aluno → Responde →
"+15 XP! Streak mantido! Te vejo amanha."
```

### Flow 4: Retorno Apos Inatividade

```
Aluno (voltou apos 2 semanas) → "Oi" →
Koda: "Bem-vindo de volta! Voce ja domina 8 conceitos.
 Que tal revisar os 2 ultimos? Quiz de 1 minuto." →
Aluno responde quiz → "Lembrou tudo! Vamos continuar de onde parou."
```

### Flow 5: Web App (Dashboard)

```
Aluno abre web → Login com telefone (magic link via WhatsApp) →
Dashboard: XP total, streak, nivel, conceitos dominados →
Roadmap: mapa visual com ilhas (clica para ver conceitos) →
Playground: editor Monaco com templates do Koda →
Badges: colecao de conquistas
```

---

## 8. Metricas de Sucesso

### Metricas de Produto

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

### Metricas Founder-First (Pedro)

| Metrica | Meta | Prazo |
|---------|------|-------|
| Pedro completa Fase 1 | Entende fundamentos | Semana 6 |
| Pedro le codigo do Koda | Entende o produto | Semana 10 |
| Pedro faz primeira mudanca | Primeiro commit real | Semana 16 |
| Pedro implementa feature | Developer junior | Semana 24 |
| Pedro cria SEU SaaS | Autonomia total | Semana 36 |

### Metricas de Negocio

| Metrica | Meta |
|---------|------|
| LTV:CAC | > 3:1 |
| MRR (100 alunos pagos) | R$ 4.900 - R$ 9.700 |
| Churn mensal | < 10% |
| NPS | > 40 |
| Custo por aluno/mes | < R$ 5,00 |

---

## 9. Fases de Implementacao

### Fase 1 — MVP Core (Semanas 1-4)

**Foco: core que Pedro vai usar como aluno #1**

- [ ] Setup projeto (package.json, tsconfig, estrutura de pastas)
- [ ] Schema Supabase (migrations para users, progress, sessions, interactions, gamification)
- [ ] RLS policies
- [ ] Webhook Evolution API → Hono
- [ ] Intent Classifier (Claude Haiku, 14 intents)
- [ ] State Machine basica (IDLE, ONBOARDING, HUB, LESSON, GATE_1, GATE_2)
- [ ] AI Engine (Claude Sonnet com system prompts em 6 camadas)
- [ ] Context Builder
- [ ] Response Formatter (WhatsApp markup)
- [ ] Onboarding flow (4 perguntas)
- [ ] Primeira aula (Logica de programacao — conceitos + portoes 1 e 2)
- [ ] XP basico (Pedro ve progresso)
- [ ] Deploy na VPS com PM2

### Fase 2 — Anti-Abandono + Gamificacao (Semanas 5-8)

**Foco: se Pedro abandonar na semana 3, o projeto morre**

- [ ] Formato rotator (8 formatos, anti-monotonia)
- [ ] Sistema de XP completo + streak + regra dos 30 segundos
- [ ] Badges
- [ ] Mood selector (focado/de boa/quero jogar/cansei)
- [ ] Re-engajamento proativo (cascata de mensagens)
- [ ] Zero culpa (re-entry handler)
- [ ] Dificuldade adaptativa
- [ ] Portao 3
- [ ] Modulos 2-3 (HTML, CSS)
- [ ] Web App: dashboard + login (Supabase Auth)
- [ ] Web App: mapa visual (roadmap gamificado)

### Fase 3 — Conteudo + Polish (Semanas 9-12)

- [ ] Modulos 4-6 (Git, Terminal, Como a web funciona)
- [ ] Code playground (web, Monaco editor)
- [ ] Audio (Whisper integration)
- [ ] Notificacoes/lembretes
- [ ] Spaced repetition
- [ ] Dropout Risk Score (modelo preditivo)
- [ ] Progresso visivel (barras, summaries, relatorio semanal)

### Fase 4 — Monetizacao (Semanas 13-16)

- [ ] Stripe integration
- [ ] Planos (free trial 7 dias, Basic R$ 49/mes, Pro R$ 97/mes)
- [ ] Limites por plano
- [ ] Dashboard admin (metricas do negocio)
- [ ] "Abrir o capo" — feature educacional que mostra codigo real do Koda

---

## 10. Estimativa de Custos

### MVP (100 alunos)

| Servico | Custo Mensal | Notas |
|---------|-------------|-------|
| VPS | Ja tem | Evolution + Hono rodam na VPS existente |
| Supabase | $0 (free tier) | Ate 50k rows, 500MB, 50k auth users |
| Claude Sonnet | ~$50-100 | ~5 msgs/dia/aluno x 100 alunos x ~$0.003/msg |
| Claude Haiku | ~$5-10 | Classificador, muito barato |
| Whisper | ~$5-10 | Se 20% das msgs forem audio |
| Vercel | $0 (hobby) | Free tier para web app |
| Dominio | ~$10/ano | koda.app ou similar |
| **TOTAL** | **~$70-130/mes** | |

### Custo por Aluno

| Cenario | Custo/aluno/mes |
|---------|----------------|
| 100 alunos | ~$0.70-1.30 |
| 500 alunos | ~$0.50-0.80 |
| 1000 alunos | ~$0.40-0.60 |

---

## 11. Matriz de Riscos

| Risco | Probabilidade | Impacto | Mitigacao |
|-------|-------------|---------|-----------|
| Claude API fora do ar | Baixa | Alto | Mensagem fallback "Voltamos em breve", retry 1x |
| Custo de API explode com escala | Media | Alto | Rate limit, cache de respostas comuns, monitoramento |
| Evolution API instavel | Media | Alto | Health check + restart automatico (PM2) |
| Pedro abandona na semana 3 | Media | Critico | Anti-dropout ativado desde semana 1, sprint 2 dedicado |
| Aluno faz prompt injection | Alta | Baixo | System prompt robusto + guardrails |
| Latencia > 15s | Media | Medio | Timeout + indicador "digitando..." + fila |
| Supabase free tier insuficiente | Baixa (MVP) | Medio | Upgrade quando necessario (~$25/mes) |
| Qualidade do ensino insatisfatoria | Media | Alto | Pedro testa como aluno #1, feedback loop continuo |
| WhatsApp bloqueia numero | Baixa | Alto | Seguir politicas de uso, nao enviar spam |

---

## 12. Schema do Banco de Dados (Visao de Alto Nivel)

### Tabelas Principais

| Tabela | Descricao | RLS |
|--------|-----------|-----|
| `users` | Perfil do aluno (phone, name, objective, level, plan) | Sim |
| `progress` | Progresso por conceito (gate_1/2/3_status, mastery_level) | Sim |
| `sessions` | Estado da conversa FSM (current_state, mood, context_stack) | Sim |
| `interactions` | Historico de mensagens (msg_in, msg_out, intent, tokens, latencia) | Sim |
| `gamification` | XP, streak, badges, nivel, koda_coins | Sim |
| `modules` | Curriculo — modulos (fase, nome, prerequisitos) | Publico (leitura) |
| `concepts` | Curriculo — conceitos (explicacao, analogia, exercicios, criterios) | Publico (leitura) |
| `reengagement_log` | Log de mensagens de re-engajamento enviadas | Sim |
| `difficulty_signals` | Sinais de dificuldade por sessao | Sim |

---

## 13. Estrutura do Repositorio

```
koda/
├── src/
│   ├── index.ts                    # Entry point — Hono server
│   ├── routes/
│   │   ├── webhook.ts              # POST /webhook/evolution
│   │   ├── health.ts               # GET /health
│   │   └── api/                    # Endpoints para web app
│   ├── core/
│   │   ├── classifier.ts           # Intent classifier (Haiku)
│   │   ├── state-machine.ts        # Conversation FSM
│   │   ├── context-builder.ts      # Monta prompt em 6 camadas
│   │   ├── ai-engine.ts            # Claude Sonnet
│   │   └── response-formatter.ts   # WhatsApp markup
│   ├── modules/
│   │   ├── onboarding/             # Fluxo de onboarding
│   │   ├── lesson/                 # Fluxo de aula + gate evaluator
│   │   ├── exercise/               # Correcao de codigo
│   │   ├── quiz/                   # Quiz relampago, ache-o-bug
│   │   ├── doubt/                  # Modo duvida rapida
│   │   └── gamification/           # XP, streaks, badges
│   ├── services/
│   │   ├── evolution.ts            # Client Evolution API
│   │   ├── supabase.ts             # Client Supabase
│   │   ├── claude.ts               # Client Claude (Sonnet + Haiku)
│   │   └── whisper.ts              # Client Whisper
│   ├── db/
│   │   ├── schema.ts               # Tipos TypeScript
│   │   └── queries/                # CRUD por entidade
│   └── utils/
│       ├── rate-limiter.ts
│       ├── logger.ts
│       └── constants.ts
├── prompts/                         # System prompts versionados (.md)
├── curriculum/                      # Conteudo curricular (YAML)
│   ├── modules/                     # 01-logica.yaml ... 30-projeto-final.yaml
│   └── index.yaml                   # Indice com prerequisitos
├── web/                             # Next.js 16 Web App (Vercel)
│   └── src/app/                     # App Router pages
├── db/
│   └── migrations/                  # SQL migrations para Supabase
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── docs/
│   ├── architecture/
│   ├── prd.md                       # ESTE DOCUMENTO
│   ├── product-vision.md
│   ├── curriculum-structure.md
│   └── progression-system.md
├── package.json
├── tsconfig.json
└── .env.example
```

---

## 14. Deploy

### Backend (VPS)

```
GitHub → Push to main → GitHub Actions → SSH deploy to VPS
                                          ├── npm install
                                          ├── npm run build
                                          ├── pm2 restart koda
                                          └── health check
```

- PM2 gerencia o processo Hono na VPS (port 3333)
- Nginx como reverse proxy (HTTPS)

### Web App (Vercel)

```
GitHub (branch main, pasta web/) → Vercel auto-deploy
```

- Root directory: `web/`
- Framework: Next.js (auto-detected)
- Env vars: SUPABASE_URL, SUPABASE_ANON_KEY

### Banco (Supabase)

- Migrations versionadas em `db/migrations/`
- Aplicar com `supabase db push`
- Backups automaticos gerenciados pelo Supabase

---

## 15. Diferencial Competitivo

| Mercado Tradicional | Koda |
|---------------------|------|
| Video de 2h | Sessao de 3 minutos |
| Mesmo formato sempre | 8 formatos que variam toda sessao |
| Lista de modulos | Mapa visual tipo jogo (ilhas) |
| "Assistiu" = progresso | 3 portoes = demonstracao real |
| So uma plataforma | WhatsApp + Web sincronizados |
| Passivo (assiste) | Ativo (responde, coda, explica) |
| Sem recompensa | XP, streaks, badges, niveis |
| Ritmo fixo | Adapta ao humor/energia do dia |
| Ignora neurodivergencia | Desenhado para TDAH (7 mecanismos anti-dropout) |
| Pune abandono | Celebra retorno (zero culpa) |

---

## Metadata

- **Versao PRD:** 2.0
- **Status:** Aprovado
- **Stack:** Evolution API v2 + Hono + Supabase + Claude Sonnet 4 / Haiku 4.5 + Next.js 16 + Whisper
- **Ultima atualizacao:** 29 de marco de 2026
- **Mantido por:** Morgan (@pm)
