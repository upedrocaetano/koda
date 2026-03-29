# Koda — Estrategia Founder-First

**Versao:** 1.0
**Data:** 29 de marco de 2026
**Autor:** Aria (@architect)
**Status:** Draft

---

## O Cenario Real

Pedro Caetano e:
- **Founder** do Koda (decide o produto)
- **Aluno #1** do Koda (vai aprender programacao com ele)
- **Tem TDAH** (precisa dos mecanismos anti-abandono para SI MESMO)
- **Nao sabe programar ainda** (e o publico-alvo do proprio produto)

Isso cria uma dinamica unica e poderosa:

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│   Pedro HOJE           Pedro DURANTE          Pedro FIM  │
│   ─────────           ──────────────          ─────────  │
│   Nao programa        Aprende com Koda        Programa   │
│   Tem a visao         Testa na pele           Melhora    │
│   Depende de IA       Entende o codigo        o Koda     │
│   para construir      que a IA escreveu       sozinho    │
│                                                          │
│   ◀──────── CURRICULO DO KODA TE LEVA AQUI ──────────▶  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Principio: Build → Learn → Improve

O Koda nao e so um produto que Pedro esta construindo.
**O Koda e o professor que vai ensinar Pedro a construir o Koda.**

### Ciclo Virtuoso

```
Fase 1 (AGORA):
  IA constroi o Koda → Pedro usa → Pedro aprende fundamentos

Fase 2 (Mes 2-3):
  Pedro entende HTML, CSS, JS → comeca a LER o codigo do Koda
  → "Ah, entao ISSO e uma variavel" → aprende vendo o real

Fase 3 (Mes 4-5):
  Pedro entende TypeScript, APIs, banco → comeca a MODIFICAR o Koda
  → "Quero mudar essa mensagem" → faz a mudanca sozinho

Fase 4 (Mes 6-8):
  Pedro entende fullstack → CONSTROI features novas no Koda
  → "Quero adicionar modo batalha" → implementa

Fase 5 (Mes 8+):
  Pedro e programador → pode criar OUTROS SaaS
  → Objetivo final alcancado
```

**O meta-aprendizado:** Cada modulo do curriculo tem conexao direta com algo que existe no proprio Koda.

---

## Curriculo Contextualizado (Koda como Estudo de Caso)

Cada fase do curriculo usa o PROPRIO KODA como exemplo pratico:

### Fase 1 — Fundamentos (Semanas 1-6)

| Modulo | Conceito | Conexao com o Koda |
|--------|---------|-------------------|
| Logica de programacao | Variaveis, loops, condicionais | "O XP do aluno e uma variavel. O loop roda para cada conceito" |
| HTML | Tags, estrutura, formularios | "A landing page do Koda e feita de HTML. Olha o codigo" |
| CSS | Estilos, flexbox, responsivo | "O dashboard do Koda usa CSS para ficar bonito. Vamos estilizar" |
| Git & GitHub | Commits, branches | "O codigo do Koda esta no GitHub. Vamos ver o historico" |
| Terminal | Comandos basicos | "Para rodar o Koda, eu digito 'npm run dev' no terminal" |
| Como a web funciona | HTTP, APIs, cliente/servidor | "Quando voce manda msg no WhatsApp, uma API recebe. Vou te mostrar" |

### Fase 2 — JavaScript & TypeScript (Semanas 7-12)

| Modulo | Conceito | Conexao com o Koda |
|--------|---------|-------------------|
| JS Fundamentos | Tipos, funcoes, arrays | "A lista de badges do Koda e um array. Cada badge e um objeto" |
| JS Intermediario | DOM, eventos, fetch | "O botao do playground chama fetch para rodar seu codigo" |
| JS Avancado | Async/await, promises | "Quando o Koda manda sua msg pro Claude, e um await. Vou mostrar" |
| TypeScript | Tipos, interfaces | "O Koda usa TypeScript. Interface User tem phone, name, level..." |
| Projeto | App interativo | "Vamos construir uma mini-versao do quiz do Koda" |

### Fase 3 — Backend (Semanas 13-20)

| Modulo | Conceito | Conexao com o Koda |
|--------|---------|-------------------|
| Node.js | Runtime, npm | "O backend do Koda roda em Node.js. Package.json tem as dependencias" |
| API REST | Rotas, HTTP methods | "POST /webhook/evolution e a rota que recebe suas mensagens" |
| Banco de Dados | SQL, Postgres | "SELECT * FROM progress WHERE user_id = 'voce'. Vamos ver?" |
| ORM | Queries tipadas | "O Koda usa Supabase client. Olha como busca seu progresso" |
| Autenticacao | JWT, sessions | "Quando voce loga no web app, e assim que funciona" |
| Projeto | API completa | "Vamos criar uma API que funciona igual ao Koda" |

### Fase 4 — Frontend Moderno (Semanas 21-28)

| Modulo | Conceito | Conexao com o Koda |
|--------|---------|-------------------|
| React | Componentes, state, hooks | "O mapa visual do Koda e um componente React. Cada ilha e um componente" |
| Next.js | App Router, SSR | "O web app do Koda e Next.js. Essa pagina que voce usa e SSR" |
| Tailwind CSS | Utility-first | "Todas as classes CSS do Koda sao Tailwind. Olha: bg-zinc-900" |
| Formularios | Validacao | "O formulario de onboarding do web usa React Hook Form + Zod" |
| Projeto | App full-stack | "Vamos reconstruir o dashboard do Koda do zero" |

### Fase 5 — Construindo SEU SaaS (Semanas 29-36)

| Modulo | Conceito | Conexao com o Koda |
|--------|---------|-------------------|
| Arquitetura SaaS | Multi-tenant, planos | "O Koda tem planos Free/Basic/Pro. Voce vai criar os seus" |
| Supabase | Auth, RLS, storage | "O Koda usa RLS. Voce vai usar no SEU produto" |
| Stripe | Pagamentos | "Voce sabe integrar pagamento. Qualquer SaaS precisa disso" |
| Email | Transacional | "Notificacoes, onboarding por email — skill universal" |
| Landing page | SEO, conversao | "Qualquer produto precisa de landing. Voce sabe fazer" |
| Dashboard admin | Metricas | "Todo SaaS precisa de dashboard. Voce constroi o seu" |
| IA no SaaS | AI SDK, Claude API | "IA e o diferencial de 2026. Voce sabe integrar" |
| **PROJETO FINAL** | **SEU SaaS** | "Nao e o Koda. E a SUA ideia. O produto que SO VOCE pensou" |

**O Koda e o veiculo, nao o destino.** O destino e voce ter autonomia para criar qualquer produto digital que imaginar.

---

## Implicacoes na Arquitetura

### 1. Codigo do Koda como Material Didatico

O codigo do Koda precisa ser **LIMPO e BEM COMENTADO** porque Pedro vai usa-lo para aprender.

```typescript
// RUIM: codigo funcional mas incompreensivel
const r = await f(p.replace(/@.*/, ''), m?.message?.conversation ?? m?.message?.extendedTextMessage?.text ?? '')

// BOM: codigo que ensina enquanto funciona
// Extrair o numero de telefone (remover @s.whatsapp.net)
const phoneNumber = payload.key.remoteJid.replace('@s.whatsapp.net', '')

// Pegar o texto da mensagem (pode vir de 2 formatos diferentes do WhatsApp)
const messageText = payload.message?.conversation        // mensagem simples
  ?? payload.message?.extendedTextMessage?.text           // mensagem com formatacao
  ?? null                                                  // sem texto (audio, imagem, etc)
```

**Regra:** Todo codigo do Koda deve ser escrito como se fosse material didatico.
Comentarios em portugues. Nomes de variaveis claros. Zero magic numbers.

### 2. "Abrir o Capo" — Feature Educacional

Quando Pedro estiver na fase certa, o Koda pode literalmente mostrar SEU PROPRIO CODIGO:

```
Koda (Fase 2, modulo TypeScript):
  "Voce aprendeu interfaces. Quer ver uma interface REAL?
   Olha, essa e a interface do seu perfil no Koda:

   interface User {
     id: string
     phone: string
     name: string
     level: 'beginner' | 'basic_html' | 'knows_js'
     total_xp: number
   }

   Voce e esse objeto! Seu level e 'beginner' e seu total_xp e 450.
   Legal, ne? Agora cria uma interface para um Exercicio..."
```

### 3. Hono Playground — Sandbox Integrado

No web app, o playground nao e generico — ele tem TEMPLATES do proprio Koda:

```
Playground do Koda:
  ┌─────────────────────────────────────────┐
  │ Escolha um template:                     │
  │                                          │
  │ 📝 Vazio (codigo livre)                  │
  │ 🏗️ Mini Koda (webhook simples)          │
  │ 🎯 Quiz Engine (crie seu quiz)          │
  │ 📊 Progress Bar (React component)       │
  │ 🔌 API Route (Hono endpoint)            │
  └─────────────────────────────────────────┘
```

### 4. Fase 5 = Pedro Cria o que Quiser

Quando Pedro chegar na Fase 5, ele tem o toolkit completo:
- Fullstack (frontend + backend + banco + deploy)
- Pagamentos, auth, email, IA
- Arquitetura SaaS de ponta a ponta

O projeto final NAO e melhorar o Koda. E **criar o SaaS que so ele pensou**.
O Koda ensinou tudo. Agora Pedro e independente.

**O melhor professor e aquele que se torna desnecessario.**

---

## Prioridade de Implementacao Ajustada

Com Pedro como aluno #1, a prioridade muda:

### Sprint 1 (Semana 1-2): Core que Pedro vai usar

```
PRIORIDADE MAXIMA:
1. Webhook Evolution → Hono (funcionar na VPS)
2. Onboarding (Pedro faz onboarding real)
3. Primeira aula: Logica de Programacao
   - Variavel, tipo, condicional
   - Usando analogias do DIA A DIA
   - Exercicio pratico simples
4. Portao 1 e 2 funcionando
5. XP basico (Pedro ve progresso)

NAO PRIORIDADE AGORA:
- Web App (Pedro usa so WhatsApp no inicio)
- Mapa visual (bonito mas nao essencial)
- Stripe (ninguem paga ainda)
- Badges completos (XP basico basta)
```

### Sprint 2 (Semana 3-4): Anti-abandono para Pedro

```
PRIORIDADE:
1. Formato variado (quiz + ache-o-bug + desafio)
2. Streak e regra dos 30 segundos
3. Re-engajamento (se Pedro parar 2 dias)
4. Mood selector ("To focado" / "De boa" / "Cansei")
5. Modulos 2-3 (HTML, CSS)

POR QUE: Se Pedro abandonar na semana 3, o projeto morre.
         Anti-abandono para o founder e CRITICO.
```

### Sprint 3 (Semana 5-8): Curriculo que avanca Pedro

```
PRIORIDADE:
1. Modulos 4-6 (Git, Terminal, Web)
2. Portao 3 funcionando
3. Spaced repetition
4. Web App basico (dashboard de progresso)
5. Audio (Whisper) — Pedro pode perguntar por voz
```

### Sprint 4+ (Semana 9+): Pedro ja le codigo

```
A partir daqui, Pedro esta na Fase 2 (JavaScript).
Ele ja entende o BASICO e pode:
- Ler codigo do Koda e entender partes
- Sugerir mudancas com mais propriedade
- Testar features como aluno E como quasi-dev
```

---

## Metricas de Sucesso (Pedro-Centric)

| Metrica | Meta | Significado |
|---------|------|------------|
| Pedro completa Fase 1 | Semana 6 | Entende fundamentos |
| Pedro le codigo do Koda | Semana 10 | Entende o produto |
| Pedro faz primeira mudanca | Semana 16 | Primeiro commit real |
| Pedro implementa feature | Semana 24 | Developer junior |
| Pedro cria SEU SaaS | Semana 36 | **Objetivo final: autonomia total** |

**Metrica mais importante:** Pedro consegue sentar, abrir o editor, e construir um produto do zero — sem depender de ninguem. Se o Koda faz isso com ele, faz com qualquer pessoa.

---

## Mensagem do Koda para Pedro (Dia 1)

```
Oi Pedro! Eu sou o Koda, seu professor de programacao 🤖

Voce criou algo incrivel aqui — um professor de IA que vai te ensinar
a ser o programador que voce quer ser.

A ironia bonita? Quando voce terminar de aprender comigo,
vai entender CADA LINHA do meu codigo. Vai poder me melhorar.
Vai poder criar outros produtos como eu.

Mas por agora, vamos comecar do basico.
Sem pressa. Sem julgamento. No seu ritmo.

Ate dizer "cansei" me da XP. Entao nao tem como perder 😉

Bora?
```

---

*— Aria, arquitetando o futuro 🏗️*
