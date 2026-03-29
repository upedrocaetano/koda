# Koda — Schema do Banco de Dados

**Versao:** 1.0
**Data:** 29 de marco de 2026
**Autor:** Dara (@data-engineer)
**Status:** Draft — aguardando validacao

---

## 1. Diagrama ER (Visao Geral)

```
┌──────────────────┐       ┌──────────────────┐
│      modules     │       │     concepts     │
│──────────────────│       │──────────────────│
│ id (PK)          │◄──┐   │ id (PK, uuid)    │
│ name             │   └───│ module_id (FK)    │
│ description      │       │ name              │
│ phase            │       │ description       │
│ order_index      │       │ order_index       │
│ prerequisites    │       │ gate_type         │
│ concepts_count   │       │ difficulty_level  │
│ estimated_hours  │       └────────┬─────────┘
│ difficulty       │                │
└──────────────────┘                │ (concept_id)
                                    │
┌──────────────────┐       ┌────────▼─────────┐
│      users       │       │    progress      │
│──────────────────│       │──────────────────│
│ id (PK, uuid)    │◄──┐   │ id (PK, uuid)    │
│ phone (UNIQUE)   │   ├───│ user_id (FK)     │
│ name             │   │   │ concept_id (FK)  │
│ level            │   │   │ gate_1_passed    │
│ total_xp         │   │   │ gate_2_passed    │
│ current_streak   │   │   │ gate_3_passed    │
│ max_streak       │   │   │ attempts         │
│ dropout_risk     │   │   │ xp_earned        │
│ mood             │   │   │ completed_at     │
│ onboarding_done  │   │   └──────────────────┘
│ preferences      │   │
│ last_active_at   │   │   ┌──────────────────┐
│ created_at       │   │   │    sessions      │
│ updated_at       │   │   │──────────────────│
└──────┬───────────┘   ├───│ user_id (FK)     │
       │               │   │ id (PK, uuid)    │
       │               │   │ started_at       │
       │               │   │ ended_at         │
       │               │   │ messages_count   │
       │               │   │ xp_earned        │
       │               │   │ mood_start       │
       │               │   │ mood_end         │
       │               │   │ state            │
       │               │   └────────┬─────────┘
       │               │            │ (session_id)
       │               │   ┌────────▼─────────┐
       │               │   │  interactions    │
       │               │   │──────────────────│
       │               ├───│ user_id (FK)     │
       │               │   │ session_id (FK)  │
       │               │   │ id (PK, uuid)    │
       │               │   │ type (enum)      │
       │               │   │ user_message     │
       │               │   │ bot_response     │
       │               │   │ intent           │
       │               │   │ state            │
       │               │   │ xp_earned        │
       │               │   │ metadata (jsonb) │
       │               │   └──────────────────┘
       │               │
       │               │   ┌──────────────────┐
       │               │   │  gamification    │
       │               │   │──────────────────│
       │               ├───│ user_id (FK)     │
       │               │   │ id (PK, uuid)    │
       │               │   │ type (enum)      │
       │               │   │ name             │
       │               │   │ earned_at        │
       │               │   │ metadata (jsonb) │
       │               │   └──────────────────┘
       │               │
       │               │   ┌──────────────────────┐
       │               │   │ conversation_state   │
       │               │   │──────────────────────│
       │               ├───│ user_id (FK, UNIQUE) │
       │               │   │ id (PK, uuid)        │
       │               │   │ current_state (enum) │
       │               │   │ context (jsonb)      │
       │               │   │ updated_at           │
       │               │   └──────────────────────┘
       │               │
       │               │   ┌──────────────────────┐
       │               │   │ reengagement_log     │
       │               │   │──────────────────────│
       │               ├───│ user_id (FK)         │
       │               │   │ id (PK, uuid)        │
       │               │   │ day_number           │
       │               │   │ template_used        │
       │               │   │ sent_at              │
       │               │   │ responded            │
       │               │   │ response_delay_hours │
       │               │   └──────────────────────┘
       │               │
       │               │   ┌──────────────────────┐
       │               │   │ difficulty_signals   │
       │               │   │──────────────────────│
       │               └───│ user_id (FK)         │
       │                   │ concept_id (FK)      │
       │                   │ id (PK, uuid)        │
       │                   │ accuracy_last_5      │
       │                   │ avg_response_time    │
       │                   │ frustration_indicators│
       │                   │ current_difficulty   │
       │                   │ adjusted_at          │
       │                   └──────────────────────┘
```

---

## 2. Tipos Enumerados (ENUMs)

| Enum | Valores | Uso |
|------|---------|-----|
| `user_level` | `beginner`, `basic_html`, `knows_js`, `knows_ts`, `backend_ready`, `fullstack`, `saas_builder`, `master` | Nivel de conhecimento do aluno |
| `gate_type` | `comprehension`, `practice`, `application` | Tipo do portao de avaliacao |
| `interaction_type` | `lesson`, `quiz`, `code_challenge`, `ache_o_bug`, `ordene_as_linhas`, `boss_fight`, `revisao`, `code_reading`, `speed_coding`, `doubt`, `feedback`, `system` | Tipo de interacao na conversa |
| `conversation_state_enum` | `IDLE`, `ONBOARDING`, `HUB`, `LESSON`, `GATE_1`, `GATE_2`, `GATE_3`, `QUIZ`, `DOUBT`, `BREAK`, `REVIEW`, `PLAYGROUND` | Estado atual da maquina de estados |
| `mood_type` | `focused`, `relaxed`, `tired`, `frustrated` | Humor do aluno (nullable) |
| `gamification_type` | `badge`, `achievement`, `milestone`, `level_up` | Tipo de evento de gamificacao |

---

## 3. Tabelas — Detalhamento Completo

### 3.1 `users` — Alunos

Tabela principal de usuarios. Cada aluno e identificado pelo telefone (WhatsApp).

| Coluna | Tipo | Constraints | Default | Descricao |
|--------|------|-------------|---------|-----------|
| `id` | `uuid` | PK | `gen_random_uuid()` | Identificador unico |
| `phone` | `text` | UNIQUE, NOT NULL | — | Telefone (formato internacional, sem @) |
| `name` | `text` | — | — | Nome do aluno |
| `objective` | `text` | — | — | Objetivo: "zero_to_dev", "career_change", "create_saas" |
| `level` | `user_level` | NOT NULL | `'beginner'` | Nivel atual de conhecimento |
| `daily_availability` | `int` | — | — | Minutos disponiveis por dia |
| `timezone` | `text` | NOT NULL | `'America/Sao_Paulo'` | Timezone do aluno |
| `total_xp` | `int` | NOT NULL | `0` | XP total acumulado |
| `current_streak` | `int` | NOT NULL | `0` | Streak atual em dias |
| `max_streak` | `int` | NOT NULL | `0` | Maior streak ja atingido |
| `dropout_risk_score` | `float` | — | `0.0` | Score de risco de abandono (0.0 a 1.0) |
| `mood` | `mood_type` | — | — | Ultimo humor registrado (nullable) |
| `onboarding_completed` | `boolean` | NOT NULL | `false` | Se completou o onboarding |
| `preferred_study_time` | `time` | — | — | Horario preferido de estudo |
| `notification_enabled` | `boolean` | NOT NULL | `true` | Se aceita notificacoes |
| `preferences` | `jsonb` | — | `'{}'` | Preferencias gerais (formato livre) |
| `last_active_at` | `timestamptz` | — | — | Ultima atividade |
| `created_at` | `timestamptz` | NOT NULL | `now()` | Data de criacao |
| `updated_at` | `timestamptz` | NOT NULL | `now()` | Ultima atualizacao |

### 3.2 `modules` — Modulos do Curriculo

Modulos representam agrupamentos de conceitos (ex: "JavaScript Fundamentos").

| Coluna | Tipo | Constraints | Default | Descricao |
|--------|------|-------------|---------|-----------|
| `id` | `int` | PK, GENERATED ALWAYS AS IDENTITY | — | ID sequencial |
| `name` | `text` | NOT NULL | — | Nome do modulo |
| `description` | `text` | — | — | Descricao do modulo |
| `phase` | `int` | NOT NULL, CHECK(1-5) | — | Fase do curriculo (1 a 5) |
| `order_index` | `int` | NOT NULL | — | Ordem de apresentacao |
| `prerequisites` | `jsonb` | — | `'[]'` | IDs dos modulos pre-requisito |
| `concepts_count` | `int` | NOT NULL | `0` | Quantidade de conceitos |
| `estimated_hours` | `float` | — | — | Horas estimadas para completar |
| `difficulty` | `int` | CHECK(1-5) | — | Dificuldade (1 a 5) |
| `created_at` | `timestamptz` | NOT NULL | `now()` | Data de criacao |

### 3.3 `concepts` — Conceitos dentro dos Modulos

Cada conceito e uma unidade de aprendizado com 3 portoes de avaliacao.

| Coluna | Tipo | Constraints | Default | Descricao |
|--------|------|-------------|---------|-----------|
| `id` | `uuid` | PK | `gen_random_uuid()` | Identificador unico |
| `module_id` | `int` | FK → modules, NOT NULL | — | Modulo pai |
| `name` | `text` | NOT NULL | — | Nome do conceito |
| `description` | `text` | — | — | Descricao do conceito |
| `order_index` | `int` | NOT NULL | — | Ordem dentro do modulo |
| `gate_type` | `gate_type` | NOT NULL | `'comprehension'` | Tipo padrao do portao |
| `difficulty_level` | `int` | NOT NULL, CHECK(1-5) | `1` | Nivel de dificuldade |
| `created_at` | `timestamptz` | NOT NULL | `now()` | Data de criacao |

**Constraint unica:** `(module_id, order_index)` — nao pode ter dois conceitos na mesma posicao.

### 3.4 `progress` — Progresso do Aluno por Conceito

Rastreia o avanço de cada aluno em cada conceito, incluindo os 3 portoes.

| Coluna | Tipo | Constraints | Default | Descricao |
|--------|------|-------------|---------|-----------|
| `id` | `uuid` | PK | `gen_random_uuid()` | Identificador unico |
| `user_id` | `uuid` | FK → users, NOT NULL | — | Aluno |
| `concept_id` | `uuid` | FK → concepts, NOT NULL | — | Conceito |
| `gate_1_passed` | `boolean` | NOT NULL | `false` | Portao 1 (compreensao) aprovado |
| `gate_2_passed` | `boolean` | NOT NULL | `false` | Portao 2 (pratica) aprovado |
| `gate_3_passed` | `boolean` | NOT NULL | `false` | Portao 3 (aplicacao) aprovado |
| `attempts` | `int` | NOT NULL | `0` | Tentativas totais |
| `xp_earned` | `int` | NOT NULL | `0` | XP ganho neste conceito |
| `completed_at` | `timestamptz` | — | — | Quando completou todos portoes |
| `created_at` | `timestamptz` | NOT NULL | `now()` | Data de criacao |
| `updated_at` | `timestamptz` | NOT NULL | `now()` | Ultima atualizacao |

**Constraint unica:** `(user_id, concept_id)` — um registro por aluno/conceito.

### 3.5 `sessions` — Sessoes de Conversa

Cada sessao representa uma conversa continua entre aluno e Koda.

| Coluna | Tipo | Constraints | Default | Descricao |
|--------|------|-------------|---------|-----------|
| `id` | `uuid` | PK | `gen_random_uuid()` | Identificador unico |
| `user_id` | `uuid` | FK → users, NOT NULL | — | Aluno |
| `started_at` | `timestamptz` | NOT NULL | `now()` | Inicio da sessao |
| `ended_at` | `timestamptz` | — | — | Fim da sessao (null = ativa) |
| `messages_count` | `int` | NOT NULL | `0` | Quantidade de mensagens |
| `xp_earned` | `int` | NOT NULL | `0` | XP ganho na sessao |
| `mood_start` | `mood_type` | — | — | Humor no inicio |
| `mood_end` | `mood_type` | — | — | Humor no final |
| `state` | `conversation_state_enum` | NOT NULL | `'IDLE'` | Estado FSM ao final |
| `created_at` | `timestamptz` | NOT NULL | `now()` | Data de criacao |

### 3.6 `interactions` — Historico de Mensagens

Cada mensagem trocada entre aluno e Koda.

| Coluna | Tipo | Constraints | Default | Descricao |
|--------|------|-------------|---------|-----------|
| `id` | `uuid` | PK | `gen_random_uuid()` | Identificador unico |
| `session_id` | `uuid` | FK → sessions, NOT NULL | — | Sessao pai |
| `user_id` | `uuid` | FK → users, NOT NULL | — | Aluno (desnormalizado para RLS) |
| `type` | `interaction_type` | NOT NULL | `'lesson'` | Tipo da interacao |
| `user_message` | `text` | NOT NULL | — | Mensagem do aluno |
| `bot_response` | `text` | NOT NULL | — | Resposta do Koda |
| `intent` | `text` | — | — | Intencao classificada |
| `intent_confidence` | `float` | — | — | Confianca da classificacao (0-1) |
| `state` | `conversation_state_enum` | — | — | Estado FSM no momento |
| `xp_earned` | `int` | NOT NULL | `0` | XP ganho nesta interacao |
| `ai_model` | `text` | — | — | Modelo usado ("sonnet"/"haiku") |
| `tokens_in` | `int` | — | — | Tokens de entrada |
| `tokens_out` | `int` | — | — | Tokens de saida |
| `latency_ms` | `int` | — | — | Latencia em ms |
| `metadata` | `jsonb` | — | `'{}'` | Decisoes do Claude, dados extras |
| `created_at` | `timestamptz` | NOT NULL | `now()` | Data de criacao |

### 3.7 `gamification` — Badges, Conquistas e Marcos

Eventos de gamificacao do aluno.

| Coluna | Tipo | Constraints | Default | Descricao |
|--------|------|-------------|---------|-----------|
| `id` | `uuid` | PK | `gen_random_uuid()` | Identificador unico |
| `user_id` | `uuid` | FK → users, NOT NULL | — | Aluno |
| `type` | `gamification_type` | NOT NULL | — | Tipo do evento |
| `name` | `text` | NOT NULL | — | Nome do badge/conquista |
| `earned_at` | `timestamptz` | NOT NULL | `now()` | Quando ganhou |
| `metadata` | `jsonb` | — | `'{}'` | Dados extras (criterio, contexto) |

**Constraint unica:** `(user_id, type, name)` — um aluno nao pode ganhar o mesmo badge 2x.

### 3.8 `conversation_state` — Estado da Maquina de Estados (FSM)

Armazena o estado atual da conversa de cada aluno. Uma linha por aluno.

| Coluna | Tipo | Constraints | Default | Descricao |
|--------|------|-------------|---------|-----------|
| `id` | `uuid` | PK | `gen_random_uuid()` | Identificador unico |
| `user_id` | `uuid` | FK → users, UNIQUE, NOT NULL | — | Aluno (1:1) |
| `current_state` | `conversation_state_enum` | NOT NULL | `'IDLE'` | Estado atual |
| `context` | `jsonb` | — | `'{}'` | Contexto: module_id, concept_id, gate, attempts, stack |
| `updated_at` | `timestamptz` | NOT NULL | `now()` | Ultima atualizacao |

### 3.9 `reengagement_log` — Log de Re-engajamento

Registra mensagens de re-engajamento enviadas para alunos inativos.

| Coluna | Tipo | Constraints | Default | Descricao |
|--------|------|-------------|---------|-----------|
| `id` | `uuid` | PK | `gen_random_uuid()` | Identificador unico |
| `user_id` | `uuid` | FK → users, NOT NULL | — | Aluno |
| `day_number` | `int` | NOT NULL | — | Dia de inatividade (2, 3, 5, 7, 14, 30) |
| `template_used` | `text` | NOT NULL | — | Template da mensagem |
| `sent_at` | `timestamptz` | NOT NULL | `now()` | Quando enviou |
| `responded` | `boolean` | NOT NULL | `false` | Se o aluno respondeu |
| `response_delay_hours` | `float` | — | — | Tempo ate responder (horas) |

### 3.10 `difficulty_signals` — Sinais de Dificuldade

Rastreia sinais de dificuldade adaptativa por aluno e conceito.

| Coluna | Tipo | Constraints | Default | Descricao |
|--------|------|-------------|---------|-----------|
| `id` | `uuid` | PK | `gen_random_uuid()` | Identificador unico |
| `user_id` | `uuid` | FK → users, NOT NULL | — | Aluno |
| `concept_id` | `uuid` | FK → concepts, NOT NULL | — | Conceito |
| `accuracy_last_5` | `float` | — | — | Acuracia dos ultimos 5 exercicios (0-1) |
| `avg_response_time` | `int` | — | — | Tempo medio de resposta em ms |
| `frustration_indicators` | `int` | NOT NULL | `0` | Contagem de sinais de frustracao |
| `current_difficulty` | `int` | NOT NULL, CHECK(1-5) | `3` | Nivel de dificuldade atual |
| `adjusted_at` | `timestamptz` | NOT NULL | `now()` | Ultimo ajuste |

**Constraint unica:** `(user_id, concept_id)` — um registro por aluno/conceito.

---

## 4. Estrategia de Indices

### 4.1 Indices Primarios (criados automaticamente)

Todas as PKs (uuid/int) ja possuem indice unico automatico.

### 4.2 Indices de Busca Frequente

| Tabela | Indice | Tipo | Justificativa |
|--------|--------|------|---------------|
| `users` | `phone` | UNIQUE | Busca de usuario por telefone (toda mensagem) |
| `users` | `last_active_at` | B-tree | Cron de risco de abandono e re-engajamento |
| `users` | `dropout_risk_score` | B-tree | Filtragem de alunos em risco |
| `progress` | `(user_id, concept_id)` | UNIQUE | Busca de progresso por aluno + conceito |
| `progress` | `user_id` | B-tree | Listar todo progresso de um aluno |
| `sessions` | `user_id` | B-tree | Listar sessoes de um aluno |
| `sessions` | `(user_id, started_at DESC)` | B-tree | Ultima sessao do aluno |
| `interactions` | `session_id` | B-tree | Listar interacoes de uma sessao |
| `interactions` | `(user_id, created_at DESC)` | B-tree | Historico recente do aluno |
| `gamification` | `user_id` | B-tree | Listar badges de um aluno |
| `gamification` | `(user_id, type, name)` | UNIQUE | Evitar badges duplicados |
| `conversation_state` | `user_id` | UNIQUE | Busca rapida do estado (1:1) |
| `concepts` | `module_id` | B-tree | Listar conceitos de um modulo |
| `concepts` | `(module_id, order_index)` | UNIQUE | Ordem dos conceitos |
| `reengagement_log` | `(user_id, day_number)` | B-tree | Verificar se ja enviou msg para esse dia |
| `difficulty_signals` | `(user_id, concept_id)` | UNIQUE | Busca de sinais por aluno + conceito |

### 4.3 Indices para Ordenacao

| Tabela | Indice | Justificativa |
|--------|--------|---------------|
| `modules` | `(phase, order_index)` | Listagem ordenada do curriculo |
| `interactions` | `created_at DESC` | Historico ordenado |

---

## 5. Politicas RLS (Row Level Security)

### 5.1 Principio Geral

- **Alunos** so acessam seus proprios dados (filtro por `auth.uid() = user_id`)
- **Modulos e Conceitos** sao leitura publica (conteudo curricular)
- **Service role** (backend Hono) tem acesso irrestrito via `service_key`

### 5.2 Politicas por Tabela

| Tabela | Operacao | Politica | Condicao |
|--------|----------|----------|----------|
| **users** | SELECT | Aluno ve seus dados | `auth.uid() = id` |
| **users** | UPDATE | Aluno edita seus dados | `auth.uid() = id` |
| **users** | INSERT | Service role cria | Via service role |
| **progress** | ALL | Aluno ve/edita seu progresso | `auth.uid() = user_id` |
| **sessions** | ALL | Aluno ve/edita suas sessoes | `auth.uid() = user_id` |
| **interactions** | SELECT | Aluno ve suas interacoes | `auth.uid() = user_id` |
| **interactions** | INSERT | Service role insere | Via service role |
| **gamification** | SELECT | Aluno ve suas conquistas | `auth.uid() = user_id` |
| **gamification** | INSERT | Service role insere | Via service role |
| **conversation_state** | ALL | Aluno ve/edita seu estado | `auth.uid() = user_id` |
| **reengagement_log** | SELECT | Aluno ve seu log | `auth.uid() = user_id` |
| **reengagement_log** | INSERT | Service role insere | Via service role |
| **difficulty_signals** | ALL | Aluno ve/edita seus sinais | `auth.uid() = user_id` |
| **modules** | SELECT | Leitura publica | `true` |
| **concepts** | SELECT | Leitura publica | `true` |

### 5.3 Service Role

O backend Hono usa `SUPABASE_SERVICE_ROLE_KEY` para operacoes administrativas (criar usuarios, inserir interacoes, atualizar gamificacao). O service role bypassa RLS automaticamente.

---

## 6. Relacionamentos e Regras de Delecao

| FK | De → Para | ON DELETE | Justificativa |
|----|-----------|-----------|---------------|
| `concepts.module_id` | concepts → modules | CASCADE | Se modulo for removido, conceitos vao junto |
| `progress.user_id` | progress → users | CASCADE | Se aluno for removido, progresso vai junto |
| `progress.concept_id` | progress → concepts | CASCADE | Se conceito for removido, progresso vai junto |
| `sessions.user_id` | sessions → users | CASCADE | Se aluno for removido, sessoes vao junto |
| `interactions.session_id` | interactions → sessions | CASCADE | Se sessao for removida, interacoes vao junto |
| `interactions.user_id` | interactions → users | CASCADE | Se aluno for removido, interacoes vao junto |
| `gamification.user_id` | gamification → users | CASCADE | Se aluno for removido, badges vao junto |
| `conversation_state.user_id` | conv_state → users | CASCADE | Se aluno for removido, estado vai junto |
| `reengagement_log.user_id` | reengagement → users | CASCADE | Se aluno for removido, log vai junto |
| `difficulty_signals.user_id` | difficulty → users | CASCADE | Se aluno for removido, sinais vao junto |
| `difficulty_signals.concept_id` | difficulty → concepts | CASCADE | Se conceito for removido, sinais vao junto |

---

## 7. Funcao de Atualizacao Automatica

A funcao `trigger_set_updated_at` atualiza automaticamente a coluna `updated_at` em todas as tabelas que a possuem (`users`, `progress`, `conversation_state`).

---

## 8. Extensoes Necessarias

| Extensao | Uso |
|----------|-----|
| `pgcrypto` | `gen_random_uuid()` para PKs |

> **Nota:** `pgvector` sera adicionado em versao futura para embeddings de conteudo curricular.

---

## 9. Consideracoes de Performance

1. **Tabela `interactions`** cresce rapido (cada mensagem gera 1 registro). Considerar particao por mes no futuro.
2. **Tabela `sessions`** deve ser fechada (ended_at preenchido) quando inativa por >30min.
3. **JSONB fields** (`preferences`, `context`, `metadata`) permitem flexibilidade sem migrations extras.
4. **Indice em `last_active_at`** e critico para o cron de dropout risk (roda diariamente para todos usuarios).

---

*-- Dara (@data-engineer), desenhando o schema*
