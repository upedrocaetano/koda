# Koda — Product Requirements Document (PRD)

**Versão:** 1.0
**Data:** 29 de março de 2026
**Autor:** Pedro Caetano
**Status:** Draft (pronto para validação)

---

## 1. Goals and Background Context

### Goals
O **Koda** busca alcançar os seguintes objetivos:

- Oferecer um **professor de programação acessível 24/7** via WhatsApp, eliminando fricção de acesso
- **Personalizar o aprendizado** ao ritmo e nível de cada aluno, aumentando retenção e satisfação
- **Democratizar educação tech** no Brasil, atingindo alunos que não conseguem acessar bootcamps caros
- Construir um negócio sustentável com **LTV:CAC > 3:1** e retenção mensal > 90%
- Criar um modelo escalável que possa servir 10k+ alunos sem custo marginal significativo

### Background Context

A educação de programação no Brasil enfrenta uma **paradoxo crítico:**
- Há uma **demanda crescente** por talento tech (falta de 500k devs segundo pesquisas)
- Mas cursos tradicionais têm **desistência > 70%** (muito longos, caros, genéricos)
- Plataformas de ensino (Alura, Udemy) tiveram sucesso, mas criam **fricção:** desinstalar app, abrir site, focar em computador
- O **WhatsApp é o canal de menor fricção** — está no celular de 130M brasileiros, acessado 100+ vezes/dia

**O Koda resolve isso** oferecendo:
- ✅ **Aprendizado no WhatsApp** — nenhuma fricção de download/plataforma
- ✅ **Disponibilidade 24/7** — dúvidas respondidas imediatamente, qualquer hora
- ✅ **Personalização real** — adapta tom, ritmo, nível a cada aluno
- ✅ **Prático** — código real, exercícios, feedback line-by-line
- ✅ **Memória contextual** — retoma de onde parou, sem repetir conteúdo

### Change Log

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 29-Mar-2026 | 1.0 | Inicial — baseado em Project Brief v1.0 | Pedro Caetano |

---

## 2. Requirements

### Functional Requirements

#### FR1: Onboarding Inteligente
O sistema deve capturar informações do novo aluno e construir um roadmap personalizado.
- O aluno manda "Oi" ou qualquer primeira mensagem
- Professor IA responde com onboarding: "Qual é seu objetivo? Aprender do zero? Mudar de carreira?"
- Pergunta nível atual (zero experiência, já fez algum HTML, etc)
- Pergunta tempo disponível por dia (15 min, 30 min, 1h+)
- Com base nas respostas, constrói um roadmap (ex: "10 semanas de HTML/CSS até seu primeiro site")
- Armazena perfil no Supabase (user, goal, level, availability)
- Exibe roadmap visual (texto, ex: "📘 Semana 1-2: HTML Basics → Semana 3-4: CSS → Semana 5-6: JavaScript Intro...")

#### FR2: Aulas Conversacionais
O sistema deve ensinar conceitos de forma progressiva, usando exemplos e adaptando ao aluno.
- Professor explica um conceito em passos pequenos (máx 2-3 parágrafos por mensagem)
- Usa analogias simples e exemplos práticos (ex: "Uma tag HTML é como um container que embrulha seu conteúdo")
- Pede ao aluno para resumir o que entendeu ("Você consegue me explicar o que é uma div?")
- Adapta linguagem e complexidade baseado no nível do aluno (iniciante = analogias, intermediário = termos técnicos)
- Pode fazer perguntas (Socratic method) para testar compreensão
- Armazena todas as mensagens no Supabase para contexto futuro

#### FR3: Exercícios Práticos
O sistema deve propor desafios de código e avaliar as respostas do aluno.
- Após explicar um conceito, professor envia um exercício (ex: "Crie um HTML com seu nome e email")
- Aluno responde colando o código na mensagem (ou foto de tela)
- Professor lê o código, identifica erros e explica:
  - O que está certo
  - O que está errado e por quê
  - Como consertar linha a linha
  - Dicas de boas práticas
- Aluno pode tentar novamente (até acertar)
- Após acerto, professor marca exercício como completo no Supabase e avança

#### FR4: Correção de Código
O sistema deve analisar código submetido pelo aluno e dar feedback detalhado.
- Aluno pode enviar código a qualquer momento (não apenas em exercícios)
- Submete por texto (cola direto) ou foto (screenshot)
- Professor analisa e retorna:
  - Bugs encontrados (lista numerada)
  - Raiz de cada erro (por que não funciona)
  - Código corrigido (pequenas modificações destacadas)
  - Alternativas (forma melhor de fazer)
  - Performance notes (se relevante)
- Exemplo: "Seu loop tem um bug na linha 3. Você está incrementando i fora do escopo. Aqui está correto: [código]"

#### FR5: Modo Dúvida Rápida
O sistema deve responder perguntas ad-hoc sobre programação, respeitando o contexto do aluno.
- Aluno pode perguntar qualquer coisa sobre programação (não apenas assuntos da aula)
- Exemplos: "Como fazer um loop em Python?", "Qual a diferença entre var e let?", "O que é API?"
- Professor responde com precisão mas adaptado ao nível do aluno
- Não interrompe o fluxo de aula, mas pode integrar à próxima aula se relevante
- Armazenado em histórico para contexto

#### FR6: Memória de Contexto
O sistema deve lembrar do progresso anterior e retomar de forma natural.
- Cada sessão armazena: [aluno_id, data, tópico, exercícios_completados, notas]
- Quando aluno volta após dias, professor começa com: "Oi! Continuamos onde paramos: você já sabe HTML. Vamos para CSS agora?"
- Recupera histórico via Supabase (simples na V1)
- Na V2: adicionar embeddings para encontrar sessões relevantes (RAG)
- Mostra progresso: "Você completou 3 de 10 semanas do seu roadmap"

#### FR7: Visualização de Progresso
O sistema deve permitir ao aluno ver seu progresso no roadmap.
- Aluno pergunta: "Como vou no meu roadmap?" ou "Qual é meu progresso?"
- Professor responde: "📊 Você completou 3 de 10 semanas. Tópicos: ✅ HTML, ✅ CSS Basics, 🔄 CSS Advanced. Próximo: JavaScript Intro"
- Mostra visualmente (emoji + texto)
- Baseado em exercícios completados no Supabase

---

### Non-Functional Requirements

#### NFR1: Performance
- **Latência de resposta:** < 3 segundos (máximo aceitável para conversação natural)
- **Timeout:** Se API demora > 5s, retorna erro amigável ("Estou um pouco lento... tente novamente")
- **Throughput:** Capacidade de processar 1000 mensagens/dia no MVP

#### NFR2: Disponibilidade
- **Uptime:** 99.5% (máx 3h downtime/mês)
- **Failover:** Se API de IA falha, retorna mensagem padrão (não quebra conversação)
- **Rate limiting:** Máx 10 mensagens/minuto por aluno (previne abuse)

#### NFR3: Segurança
- **Webhooks:** Validação de origem (WhatsApp signature verification)
- **Dados pessoais:** Criptografar profile do aluno (nome, email, objetivo)
- **Rate limiting:** Prevenir brute force / spam
- **HTTPS only:** Todas as comunicações cifradas
- **RLS no Supabase:** Cada aluno vê apenas suas próprias sessões

#### NFR4: Escalabilidade
- **Arquitetura serverless:** Functions disparadas por webhook (sem servidor sempre ligado)
- **Banco:** Supabase com pgvector (embeddings escaláveis)
- **Cache:** Respostas comuns cacheadas (ex: "O que é HTML?")
- **Custo marginal:** Idealmente < R$ 1 por aluno/mês em APIs

#### NFR5: Confiabilidade
- **Logging:** Todas as conversas armazenadas (auditoria, debugging)
- **Error handling:** Erros loggados em Sentry, alertas se taxa > 1%
- **Mensagens idempotentes:** Se webhook é entregue 2x, não duplica resposta

#### NFR6: Usabilidade
- **Linguagem:** Português brasileiro, tom amigável e encorajador
- **Clareza:** Respostas < 2000 caracteres (limite prático do WhatsApp)
- **Acessibilidade:** Texto claro (sem jargão desnecessário)
- **Feedback:** Sempre confirmar quando aluno acerta ou erra (positivo/construtivo)

---

## 3. User Interface Design Goals

### Overall UX Vision
**Koda não é uma "app" — é uma conversa natural.** A UX é a conversa mesma.

O professor deve:
- ✅ Ser **amigável e encorajador** — nunca criticar, sempre construir
- ✅ Ser **claro e conciso** — respostas curtas, fáceis de entender no celular
- ✅ Ser **prático** — sempre exemplos reais, código real
- ✅ Ser **adaptável** — ajustar tom/complexidade ao aluno
- ✅ Ser **responsivo** — responder < 3s (sensação de conversa ao vivo)

### Key Interaction Paradigms
1. **Conversação de múltiplas voltas** — aluno → professor → aluno (não monólogos)
2. **Progressão clara** — cada mensagem avança o aprendizado (não enche linguiça)
3. **Feedback positivo** — "✅ Perfeito!" para acertos, construtivo para erros
4. **Exemplos visuais** — código em blocos formatados, não inline misturado
5. **Chamadas à ação** — "Tente fazer um loop agora" (não deixa passivo)

### Core Screens and Views
(No WhatsApp, "screens" são conversações estruturadas)

| Fluxo | Descrição |
|---|---|
| **Onboarding** | Professor faz 4 perguntas, monta roadmap |
| **Aula** | Explicação → Exemplo → Pergunta de compreensão → Exercício |
| **Exercício** | Desafio proposto → Aluno tenta → Feedback → Próximo |
| **Dúvida Rápida** | Aluno pergunta → Professor responde direto |
| **Progresso** | Aluno pede resumo → Professor mostra roadmap + completados |
| **Revisão** | Professor oferece "Quer revisar HTML antes de prosseguir?" |

### Accessibility: WCAG AA
- **Texto legível** — fonte clara, contraste suficiente (WhatsApp default)
- **Sem dependência de cor** — não usar apenas cor para significado (ex: sempre texto + emoji)
- **Emoji descriptive** — usar emoji para visual mas não como único indicador
- **Estrutura clara** — headers, bullet points, não paredes de texto

### Branding
**Tom:** Engajador, encorajador, como um colega mais experiente (não robô, não professor pomposo)

**Exemplos de resposta:**
- ✅ "Legal! Você entendeu. Agora vamos um passo além..."
- ✅ "Quase lá! O seu código tem um bug na linha 3. Vê só: [código]"
- ✅ "Perfeito! Você construiu seu primeiro HTML. Que sensação!"
- ❌ "INCORRETO. Você cometeu um erro sintático na linha 3."

**Visual markers:**
- ✅ para sucesso
- ❌ para erro
- 🔄 para em progresso
- 📘 para teoria
- 💻 para código
- 🎯 para objetivo
- 📊 para progresso

### Target Platforms
- **WhatsApp Business (Brasil)** — prioridade V1
- **Responsividade:** Mobile first (toda conversa otimizada para celular)
- **Futuro:** Considerar Telegram, TikTok DM (mas fora de V1)

---

## 4. Technical Assumptions

### Repository Structure
**Monorepo** (estrutura simples para startup)
```
koda/
├── backend/          # API Node + Express
├── prompts/          # System prompts do professor IA
├── db/               # Migrations Supabase
├── scripts/          # Utilitários (seed, analytics)
├── docs/             # PRD, Brief, arquitetura
└── .env.example      # Template de env vars
```

### Service Architecture
**Serverless + Database:** Sem servidor sempre ligado

```
WhatsApp API
    ↓
Webhook (Node/Express) — recebe mensagem
    ↓
Supabase (user lookup, context retrieval)
    ↓
Claude API (call com system prompt + context)
    ↓
Supabase (store session, exercise result)
    ↓
WhatsApp API — envia resposta
```

**Por que serverless:**
- Menos custo inicial
- Escalável (automaticamente adiciona capacity)
- Deployment simples

### Testing Requirements
**Unit + Integration (sem e2e manual na V1)**

| Nível | Foco | Tools |
|---|---|---|
| **Unit** | Funções de parsing, cálculo de progresso | Jest |
| **Integration** | Webhook → Supabase → Claude → Resposta | Node + Supertest |
| **Manual** | Conversa natural, qualidade das respostas | 5 beta users por 1 semana |

**Não fazer na V1:**
- e2e automatizados (difícil testar conversa natural)
- Testes de carga (MVPs não são scale-tested)
- Testes de segurança (fazer depois com pentest real)

### Additional Technical Assumptions

1. **Claude é melhor que GPT-4 para educação** — mais empático, explica melhor
2. **Embeddings simples (sem RAG) na V1** — histórico direto é suficiente
3. **Supabase é viável para 1k alunos** — escalável e barato
4. **WhatsApp API via Twilio é mais fácil que Z-API** — permite testes mais cedo
5. **Custo de API < R$ 2/aluno/mês** — viável com otimização de prompts
6. **Memoria de contexto cabe em 1 query** — na V1, histórico simples sem embeddings complexas
7. **Sem integração com IDEs na V1** — aluno submete código por texto/print
8. **Sem modo grupo** — apenas 1-to-1 para focar em qualidade

---

## 5. Epic List

**Objetivo:** Sequência lógica e independente de desenvolvimento, cada epic entrega valor

### Epic 1: Foundation & MVP Core
**Objetivo:** Estrutura base + conversa funcional com aluno (sem memória complexa)
- Webhook WhatsApp → Claude → resposta
- Onboarding simples (4 perguntas)
- Aula básica (explicação + exercício)
- Armazenamento simples no Supabase
- Deploy em Railway/Render

**Valor:** Prova o conceito — aluno consegue aprender conceitos via WhatsApp

---

### Epic 2: Memory & Continuity
**Objetivo:** Professor lembra do aluno, retoma de onde parou
- Sistema de usuários + sessões persistentes
- Recuperação de histórico por query
- Roadmap personalizado (sequência de tópicos)
- Revisão de progresso

**Valor:** Aluno não precisa repetir informações, educação é contínua

---

### Epic 3: Exercise & Feedback Loop
**Objetivo:** Exercícios práticos, correção de código, avaliação
- Parsing de código submetido
- Detecção de bugs e erros
- Feedback line-by-line
- Marcação de exercícios como completos

**Valor:** Aprendizado prático — aluno consegue fazer código real e receber feedback

---

### Epic 4: Monetização & Painel Admin
**Objetivo:** Cobrar de alunos, monitorar métricas
- Integração com Stripe/PagSeguro
- Planos (Free/Básico/Pro)
- Limite de uso por plano
- Dashboard de admin (métricas, alunos, churn)

**Valor:** Modelo de negócio viável, sustentabilidade

---

### Epic 5: Escalabilidade & Polimento
**Objetivo:** Otimizar performance, adicionar refinamentos UX
- Cache de respostas comuns
- Embeddings para RAG (melhor contexto)
- Notificações (lembretes de estudo)
- Analytics (cohort analysis, churn prediction)

**Valor:** Preparar para 10k+ alunos, manter qualidade

---

## 6. Epic Details

### Epic 1: Foundation & MVP Core

**Objetivo:** Estabelecer a estrutura mínima para uma conversa educacional funcional via WhatsApp, permitindo que um aluno novo faça onboarding, receba uma aula inicial e complete um exercício.

#### Story 1.1: Setup WhatsApp Webhook + Claude Integration

**Como um** desenvolvedor,
**Quero** que webhook receba mensagens do WhatsApp e resonda usando Claude,
**Para que** a conversa base funcione.

**Acceptance Criteria:**
1. Webhook endpoint (`POST /api/webhook/whatsapp`) criado e testado
2. Validação de origem do WhatsApp (signature verification) funcionando
3. Mensagem recebida → passada para Claude API com system prompt
4. Resposta do Claude → formatada e enviada de volta via WhatsApp API
5. Logs de todas as interações salvos no Supabase
6. Tratamento de erro: se Claude demora > 5s, retorna "Estou processando... aguarde"
7. Rate limiting: máx 10 mensagens/minuto por usuário
8. Testes: Unit (parsing), Integration (webhook → Claude → resposta)

**Notas técnicas:**
- Usar Twilio Sandbox para testes iniciais
- System prompt: neutro, educacional, sem memória ainda
- Supabase: tabela `interactions` (user_id, message_in, message_out, timestamp)

---

#### Story 1.2: Onboarding Flow — Capturar Perfil do Aluno

**Como um** aluno novo,
**Quero** que o professor me faça perguntas para entender meu objetivo,
**Para que** um roadmap personalizado seja criado.

**Acceptance Criteria:**
1. Primeira mensagem dispara onboarding automático
2. Sequência de 4 perguntas (objetivo, nível, tempo, nome):
   - "Qual é seu objetivo? (a) Aprender do zero, (b) Mudar de carreira, (c) Criar um produto"
   - "Qual seu nível atual? (a) Nunca programei, (b) Fiz HTML básico, (c) Sei JavaScript"
   - "Quanto tempo por dia? (a) 15 min, (b) 30 min, (c) 1h+, (d) Varia"
   - "Como você se chama?"
3. Cada pergunta aguarda resposta antes de próxima (conversa sequencial)
4. Armazena respostas no Supabase (`users` table)
5. Ao final: "Perfeito! Seu roadmap: [sequência personalizada]. Vamos começar?"
6. Testes: Simular 3 tipos de alunos (iniciante procurando emprego, intermediário com projeto, gestor)

---

#### Story 1.3: Aula Básica — Explicação + Exercício

**Como um** aluno com perfil criado,
**Quero** receber uma aula (explicação + exercício),
**Para que** eu aprenda um conceito e o coloque em prática.

**Acceptance Criteria:**
1. Aula começa com contexto: "Você já sabe X, vamos para Y"
2. Explicação em máx 3 parágrafos (analogias simples)
3. Exemplo de código fornecido
4. Pergunta de compreensão: "Você entendeu?" ou "Consegue resumir?"
5. Aguarda resposta do aluno
6. Baseado na resposta:
   - Se entendeu: avança para exercício
   - Se não entendeu: re-explica com outro ângulo
7. Exercício proposto: "Agora sua vez: [desafio específico]"
8. Aguarda código do aluno
9. Se código está correto: "✅ Perfeito! Agora vamos pro próximo conceito"
10. Se errado: "Quase lá! Linha 3 tem um erro. [Feedback específico]"
11. Armazena tudo no Supabase (`sessions` table)
12. Testes: Testar 3 caminhos (entendeu → exercício correto, não entendeu → re-explicação, exercício errado → feedback)

---

#### Story 1.4: Supabase Schema + Data Model

**Como um** desenvolvedor,
**Quero** ter um schema Supabase definido e migração rodada,
**Para que** dados do aluno sejam persistidos corretamente.

**Acceptance Criteria:**
1. Schema criado:
   - `users` (id, phone, name, objective, level, availability, created_at)
   - `sessions` (id, user_id, topic, messages[], exercises_completed, created_at)
   - `interactions` (id, user_id, message_in, message_out, metadata, timestamp)
2. RLS habilitado (cada user vê apenas seus dados)
3. Índices otimizados (user_id, created_at)
4. Migrations versionadas em `/db/migrations/`
5. Schema documentado em `docs/database.md`
6. Testes: Validar RLS com 2 usuários diferentes

---

#### Story 1.5: Deploy em Railway/Render

**Como um** desenvolvedor,
**Quero** ter a API deployada em um servidor live,
**Para que** o bot funcione em produção.

**Acceptance Criteria:**
1. Variáveis de ambiente configuradas (TWILIO_*, CLAUDE_*, DATABASE_URL)
2. GitHub Actions ou manual deploy para Railway/Render
3. Build process documentado
4. Logs acessíveis (Sentry or Railway dashboard)
5. Health check endpoint: `GET /health` retorna 200
6. Rollback plan documentado
7. Testes: Deploy → enviar mensagem real via WhatsApp → verificar resposta

---

### Epic 2: Memory & Continuity

**Objetivo:** Permitir que o professor se lembre do aluno e retome educação de forma natural, mostrando progresso.

#### Story 2.1: Recuperação de Contexto

**Como um** aluno voltando após dias,
**Quero** que o professor retome de onde paramos,
**Para que** não precise repetir tudo.

**Acceptance Criteria:**
1. Aluno volta e manda mensagem (qualquer uma)
2. Sistema recupera último tópico da sessão anterior
3. Professor responde: "Oi [nome]! Continuamos onde paramos: você aprendeu HTML. Vamos pro CSS?"
4. Se foi > 1 semana: "Vamos revisar HTML rapidinho antes?"
5. Contexto (últimas 3 sessões) passado para Claude (system prompt)
6. Armazena contexto recuperado em logs
7. Testes: Simular aluno que não usa por 3 dias, depois volta

---

#### Story 2.2: Roadmap Personalizado

**Como um** aluno,
**Quero** ver meu roadmap (sequência de tópicos),
**Para que** eu saiba onde estou e para onde vou.

**Acceptance Criteria:**
1. Roadmap criado durante onboarding (baseado em objetivo + nível)
2. Exemplos:
   - Iniciante: "Semana 1: HTML Basics → 2: CSS → 3: JavaScript Intro → 4: Loops → 5: Funções..."
   - Intermediário: "Semana 1: OOP → 2: Async/Await → 3: APIs → ..."
3. Aluno pergunta: "Qual é meu roadmap?" → Professor mostra formatado
4. Roadmap atualiza conforme exercícios são completos
5. Testes: 3 tipos de alunos, verificar roadmaps diferentes

---

#### Story 2.3: Visualização de Progresso

**Como um** aluno,
**Quero** saber quanto já completei,
**Para que** eu veja meu avanço e fico motivado.

**Acceptance Criteria:**
1. Tracking de exercícios completados por tópico
2. Aluno pergunta: "Qual é meu progresso?" ou "Como vou?"
3. Professor retorna:
   ```
   📊 Seu progresso:
   ✅ HTML Basics (3/3 exercícios)
   ✅ CSS (2/3 exercícios)
   🔄 JavaScript Intro (1/5 exercícios)

   Você está na semana 3 de 10.
   ```
4. Progresso salvo em `sessions.exercises_completed` (array)
5. Testes: Verificar cálculo de progresso com 5 cenários

---

### Epic 3: Exercise & Feedback Loop

**Objetivo:** Implementar correção de código e feedback prático.

#### Story 3.1: Parsing e Análise de Código

**Como um** professor,
**Quero** que código submetido pelo aluno seja analisado,
**Para que** eu encontre erros e dê feedback.

**Acceptance Criteria:**
1. Aluno submete código (em bloco de texto ou foto)
2. Sistema detecta linguagem (HTML, CSS, JavaScript, Python)
3. Claude analisa código:
   - Identifica bugs (erros sintáticos, lógicos)
   - Encontra warnings (boas práticas)
   - Compara com solução esperada (se existe)
4. Armazena análise em `sessions.code_analysis`
5. Testes: Submeter código com 5 tipos de erros diferentes

---

#### Story 3.2: Feedback Linha a Linha

**Como um** aluno com código errado,
**Quero** entender exatamente o que errei,
**Para que** eu corrija e aprenda.

**Acceptance Criteria:**
1. Feedback estruturado:
   - "✅ Parte correta: [O que acertou]"
   - "❌ Erro na linha X: [O que está errado e por quê]"
   - "💡 Solução: [Código corrigido com destaque das mudanças]"
   - "🎯 Próximo: [O que tentar depois]"
2. Nunca apenas "Errado!"
3. Sempre construtivo e encorajador
4. Código formatado claramente (blocos, não inline)
5. Testes: Gerar feedback para 3 códigos errados e validar qualidade

---

#### Story 3.3: Modo Dúvida Rápida

**Como um** aluno,
**Quero** fazer perguntas rápidas fora do contexto da aula,
**Para que** eu esclareça dúvidas ao aprender.

**Acceptance Criteria:**
1. Aluno pode pergunta: "O que é closure?" a qualquer momento
2. Professor responde direto (não interrompe aula)
3. Resposta adaptada ao nível do aluno (iniciante = analogia, intermediário = técnico)
4. Exemplo: "Uma closure é uma função que 'lembra' de variáveis do escopo externo. Tipo..."
5. Armazena pergunta em `interactions` para analytics
6. Testes: Fazer 10 perguntas variadas e verificar clareza das respostas

---

### Epic 4: Monetização & Painel Admin

**Objetivo:** Implementar planos de preço e dashboard básico.

#### Story 4.1: Integração Stripe

**Como um** aluno premium,
**Quero** pagar via Stripe,
**Para que** eu acesse planos pagos.

**Acceptance Criteria:**
1. Planos definidos:
   - Free: 7 dias (acesso completo, depois expira)
   - Basic: R$ 49/mês (até 2h estudo/dia, 1 trilha)
   - Pro: R$ 97/mês (ilimitado, todas trilhas)
2. Checkout integrado com Stripe
3. Webhooks: pagamento confirmado → ativar plano no Supabase
4. Cobrança recorrente
5. Testes: Mock Stripe webhooks, verificar transições de plano

---

#### Story 4.2: Limites por Plano

**Como um** aluno free,
**Quero** usar o bot livremente por 7 dias,
**Para que** eu experimente antes de pagar.

**Acceptance Criteria:**
1. Tracking de dias desde registro
2. Após 7 dias: "Seu free trial expirou! Escolha um plano para continuar"
3. Plano Basic: máx 2h conversa/dia (rastreado por timestamp)
4. Plano Pro: ilimitado
5. Message de limite: "Você usou seu limite de 2h hoje. Volta amanhã!"
6. Testes: Simular 3 usuários em planos diferentes

---

#### Story 4.3: Dashboard Admin (MVP)

**Como um** founder,
**Quero** ver métricas básicas do negócio,
**Para que** eu saiba como está o produto.

**Acceptance Criteria:**
1. Dashboard simples (web ou Vercel):
   - Total de usuários (free vs paid)
   - MRR (Monthly Recurring Revenue)
   - Churn (cancelamentos)
   - Atividade: mensagens/dia
2. Tabelas: [Usuários], [Sessões], [Revenue]
3. Filtros por período (últimos 7, 30, 90 dias)
4. Testes: Verificar cálculos de MRR e churn

---

### Epic 5: Escalabilidade & Polimento

**Objetivo:** Otimizar para 10k+ alunos e adicionar refinamentos.

#### Story 5.1: Cache de Respostas Comuns

**Como um** sistema,
**Quero** cachear respostas frequentes,
**Para que** reduzir custo de API.

**Acceptance Criteria:**
1. Detectar perguntas frequentes ("O que é um loop?", "Como fazer um if?")
2. Armazenar respostas pré-feitas no Redis/Supabase
3. Se pergunta é common: servir cache (resposta + "Veja também: [link para aprendizado]")
4. Reduzir chamadas à Claude API em ~30%
5. Testes: Simular 100 alunos fazendo perguntas repetidas

---

#### Story 5.2: Embeddings para RAG (Retrieval-Augmented Generation)

**Como um** professor,
**Quero** recuperar contexto relevante rapidamente,
**Para que** respostas sejam mais precisas.

**Acceptance Criteria:**
1. Histórico de sessões convertido em embeddings (pgvector no Supabase)
2. Nova mensagem → gera embedding → busca top-5 sessões similares
3. Contexto das sessões relevantes → passado para Claude
4. Melhora qualidade de resposta (professor "aprende" padrões do aluno)
5. Testes: Comparar respostas com/sem RAG, NPS deve melhorar

---

#### Story 5.3: Notificações & Lembretes

**Como um** aluno,
**Quero** receber lembretes para estudar,
**Para que** eu mantenha consistência.

**Acceptance Criteria:**
1. Opcionais (aluno habilita na onboarding)
2. Configurável: notificação às 19h, por exemplo
3. Método: mensagem WhatsApp ("Oi! Tempo de estudar? Você tem 30 min?")
4. Frequência: uma por dia
5. Testes: Simular 10 alunos com diferentes horários, verificar entrega

---

## 7. Next Steps

### Immediate Actions (Próximos 7 dias)

1. ✅ **Revisão do PRD** — Pedro lê, confirma escopo e aprova
2. ✅ **Validação com 3 pessoas** — Mostrar brief + PRD, coletar feedback
3. 🔄 **Ajustes rápidos** — Baseado em feedback
4. 🔄 **Kickoff do Desenvolvimento** — Começar Epic 1, Story 1.1

### Development Phases

#### Phase 1: MVP (Semanas 1–8)
- Epic 1 (Foundation & MVP Core) completo
- Deploy funcional
- Testes internos (Pedro testa 2 semanas)

#### Phase 2: Beta (Semanas 8–10)
- Recruitar 5 beta testers
- Feedback loop intenso
- Iterar rapidamente

#### Phase 3: Validação (Semana 10)
- Métricas críticas: Retention Day 7 > 40%, NPS > 40
- Go/No-go decision
- Se Go: abrir para 20 pagos (lista de espera)
- Se No-go: pivotar ou refinar

#### Phase 4: Scale (Semanas 11–24)
- Epic 2 (Memory) → 3 (Feedback) → 4 (Monetização)
- Atingir 100 usuários
- Otimizar custo por aluno
- Preparar para escala

### PM Handoff

Este PRD fornece o blueprint completo do **Koda**. Os próximos passos são:

1. **Validação de mercado** — confirmar que alunos realmente querem isso
2. **Desenvolvimento de Epic 1** — 8 semanas de iteração
3. **Teste com 5 beta users** — real feedback
4. **Tomada de decisão** — escalar ou pivotar

**Responsabilidades por fase:**
- **Product Owner (@po):** Validação, ajustes de scope, priorização
- **Desenvolvedor (@dev):** Código, testes, deploy
- **DevOps (@devops):** Infrastructure, CI/CD, monitoring

---

## Metadata

- **Versão PRD:** 1.0
- **Status:** Draft (pronto para validação)
- **Próximo Review:** Após validação com 3 pessoas
- **Última atualização:** 29 de março de 2026
- **Mantido por:** Pedro Caetano
