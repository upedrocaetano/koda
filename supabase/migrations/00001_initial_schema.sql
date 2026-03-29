-- ============================================================================
-- Koda — Schema Inicial do Banco de Dados
-- Versao: 1.0
-- Data: 29 de marco de 2026
-- Autor: Dara (@data-engineer)
--
-- Professor de programacao via WhatsApp para pessoas com TDAH.
-- 10 tabelas, 6 enums, RLS completo, indices otimizados.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. Extensoes
-- ----------------------------------------------------------------------------

-- Necessaria para gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Tipos Enumerados
-- ----------------------------------------------------------------------------

-- Nivel de conhecimento do aluno no curriculo
CREATE TYPE user_level AS ENUM (
  'beginner',       -- Nao sabe nada
  'basic_html',     -- Sabe HTML basico
  'knows_js',       -- Sabe JavaScript
  'knows_ts',       -- Sabe TypeScript
  'backend_ready',  -- Entende backend
  'fullstack',      -- Frontend + Backend
  'saas_builder',   -- Consegue criar SaaS
  'master'          -- Mestre Koda
);

-- Tipo do portao de avaliacao (3 portoes por conceito)
CREATE TYPE gate_type AS ENUM (
  'comprehension',  -- Portao 1: compreensao (explicar com suas palavras)
  'practice',       -- Portao 2: pratica (resolver exercicio)
  'application'     -- Portao 3: aplicacao (desafio combinado)
);

-- Tipo de interacao entre aluno e Koda
CREATE TYPE interaction_type AS ENUM (
  'lesson',            -- Aula/explicacao
  'quiz',              -- Quiz relampago
  'code_challenge',    -- Desafio de codigo
  'ache_o_bug',        -- Ache o bug (debugging)
  'ordene_as_linhas',  -- Ordene as linhas (puzzle logico)
  'boss_fight',        -- Boss fight (junta 3+ conceitos)
  'revisao',           -- Revisao de conceito
  'code_reading',      -- "O que esse codigo faz?"
  'speed_coding',      -- Resolva em 2 minutos
  'doubt',             -- Duvida do aluno
  'feedback',          -- Feedback do sistema
  'system'             -- Mensagem de sistema
);

-- Estado da maquina de estados da conversa (FSM)
CREATE TYPE conversation_state_enum AS ENUM (
  'IDLE',        -- Inativo, esperando mensagem
  'ONBOARDING',  -- Fluxo de onboarding (4 perguntas)
  'HUB',         -- Menu principal (mood selector)
  'LESSON',      -- Aula em andamento
  'GATE_1',      -- Portao 1: compreensao
  'GATE_2',      -- Portao 2: pratica
  'GATE_3',      -- Portao 3: aplicacao
  'QUIZ',        -- Quiz relampago
  'DOUBT',       -- Modo duvida rapida
  'BREAK',       -- Pausa (aluno cansou)
  'REVIEW',      -- Revisao de conceito antigo
  'PLAYGROUND'   -- Playground de codigo
);

-- Humor do aluno (nullable — pode nao ter informado)
CREATE TYPE mood_type AS ENUM (
  'focused',     -- Focado, quer desafio
  'relaxed',     -- De boa, ritmo leve
  'tired',       -- Cansado, quer algo rapido
  'frustrated'   -- Frustrado, precisa de apoio
);

-- Tipo de evento de gamificacao
CREATE TYPE gamification_type AS ENUM (
  'badge',        -- Badge/conquista visual
  'achievement',  -- Conquista especial
  'milestone',    -- Marco de progresso
  'level_up'      -- Subiu de nivel
);

-- ----------------------------------------------------------------------------
-- 2. Funcoes Auxiliares
-- ----------------------------------------------------------------------------

-- Funcao para atualizar updated_at automaticamente via trigger
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 3. Tabelas
-- ----------------------------------------------------------------------------

-- ===== 3.1 USERS — Alunos =====
-- Tabela principal. Cada aluno e identificado pelo telefone (WhatsApp).
-- Contem dados de perfil, gamificacao agregada e sinais anti-abandono.
CREATE TABLE users (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone                 text UNIQUE NOT NULL,            -- Telefone internacional (ex: "5511999999999")
  name                  text,                            -- Nome do aluno
  objective             text,                            -- "zero_to_dev", "career_change", "create_saas"
  level                 user_level NOT NULL DEFAULT 'beginner', -- Nivel de conhecimento
  daily_availability    int,                             -- Minutos disponiveis por dia
  timezone              text NOT NULL DEFAULT 'America/Sao_Paulo',
  total_xp              int NOT NULL DEFAULT 0,          -- XP total acumulado
  current_streak        int NOT NULL DEFAULT 0,          -- Streak atual (dias consecutivos)
  max_streak            int NOT NULL DEFAULT 0,          -- Maior streak ja atingido
  dropout_risk_score    float DEFAULT 0.0,               -- Risco de abandono: 0.0 (engajado) a 1.0 (risco alto)
  mood                  mood_type,                       -- Ultimo humor informado (nullable)
  onboarding_completed  boolean NOT NULL DEFAULT false,  -- Se completou o onboarding
  preferred_study_time  time,                            -- Horario preferido de estudo
  notification_enabled  boolean NOT NULL DEFAULT true,   -- Se aceita notificacoes de re-engajamento
  preferences           jsonb DEFAULT '{}',              -- Preferencias gerais (formato livre)
  last_active_at        timestamptz,                     -- Ultima atividade no sistema
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE users IS 'Alunos do Koda — identificados pelo telefone WhatsApp';
COMMENT ON COLUMN users.dropout_risk_score IS 'Score calculado diariamente pelo cron. 0.0 = engajado, 1.0 = risco maximo';
COMMENT ON COLUMN users.preferences IS 'JSONB livre: { "theme": "dark", "format_preferences": {...} }';

-- Trigger para updated_at automatico
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();


-- ===== 3.2 MODULES — Modulos do Curriculo =====
-- Modulos agrupam conceitos. Ex: "JavaScript Fundamentos", "HTML Basico".
-- O conteudo didatico fica em YAML no repo — aqui so metadados.
CREATE TABLE modules (
  id               int PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name             text NOT NULL,                       -- Nome do modulo
  description      text,                                -- Descricao breve
  phase            int NOT NULL CHECK (phase BETWEEN 1 AND 5), -- Fase do curriculo (1 a 5)
  order_index      int NOT NULL,                        -- Ordem de apresentacao
  prerequisites    jsonb DEFAULT '[]',                   -- IDs dos modulos pre-requisito
  concepts_count   int NOT NULL DEFAULT 0,              -- Quantidade de conceitos
  estimated_hours  float,                               -- Horas estimadas para completar
  difficulty       int CHECK (difficulty BETWEEN 1 AND 5), -- Dificuldade (1 a 5)
  created_at       timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE modules IS 'Modulos do curriculo — agrupam conceitos em unidades tematicas';
COMMENT ON COLUMN modules.prerequisites IS 'Array JSON de IDs de modulos pre-requisito. Ex: [1, 3]';


-- ===== 3.3 CONCEPTS — Conceitos dentro dos Modulos =====
-- Cada conceito e uma unidade de aprendizado avaliada por 3 portoes.
CREATE TABLE concepts (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id        int NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  name             text NOT NULL,                       -- Nome do conceito (ex: "Variaveis")
  description      text,                                -- Descricao breve
  order_index      int NOT NULL,                        -- Ordem dentro do modulo
  gate_type        gate_type NOT NULL DEFAULT 'comprehension', -- Tipo padrao do portao
  difficulty_level int NOT NULL DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  created_at       timestamptz NOT NULL DEFAULT now(),

  -- Um modulo nao pode ter dois conceitos na mesma posicao
  UNIQUE (module_id, order_index)
);

COMMENT ON TABLE concepts IS 'Conceitos individuais — unidade minima de aprendizado com 3 portoes';


-- ===== 3.4 PROGRESS — Progresso do Aluno por Conceito =====
-- Um registro por (aluno, conceito). Rastreia os 3 portoes.
CREATE TABLE progress (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  concept_id    uuid NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  gate_1_passed boolean NOT NULL DEFAULT false,         -- Portao 1: compreensao
  gate_2_passed boolean NOT NULL DEFAULT false,         -- Portao 2: pratica
  gate_3_passed boolean NOT NULL DEFAULT false,         -- Portao 3: aplicacao
  attempts      int NOT NULL DEFAULT 0,                 -- Tentativas totais nos 3 portoes
  xp_earned     int NOT NULL DEFAULT 0,                 -- XP ganho neste conceito
  completed_at  timestamptz,                            -- NULL ate completar os 3 portoes
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  -- Um aluno tem no maximo 1 registro por conceito
  UNIQUE (user_id, concept_id)
);

COMMENT ON TABLE progress IS 'Progresso do aluno por conceito — rastreia aprovacao nos 3 portoes';

-- Trigger para updated_at automatico
CREATE TRIGGER set_progress_updated_at
  BEFORE UPDATE ON progress
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();


-- ===== 3.5 SESSIONS — Sessoes de Conversa =====
-- Cada sessao e uma conversa continua entre aluno e Koda.
-- Uma sessao termina quando o aluno fica inativo por >30min ou diz "cansei".
CREATE TABLE sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at      timestamptz NOT NULL DEFAULT now(),   -- Inicio da sessao
  ended_at        timestamptz,                          -- Fim da sessao (NULL = ativa)
  messages_count  int NOT NULL DEFAULT 0,               -- Quantidade de mensagens trocadas
  xp_earned       int NOT NULL DEFAULT 0,               -- XP ganho nesta sessao
  mood_start      mood_type,                            -- Humor no inicio da sessao
  mood_end        mood_type,                            -- Humor no final da sessao
  state           conversation_state_enum NOT NULL DEFAULT 'IDLE', -- Estado FSM ao final
  created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE sessions IS 'Sessoes de conversa — uma por periodo de atividade continua';


-- ===== 3.6 INTERACTIONS — Historico de Mensagens =====
-- Cada troca de mensagem entre aluno e Koda.
-- Tabela de alto volume — considerar particao por mes no futuro.
CREATE TABLE interactions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id        uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id           uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Desnormalizado para RLS
  type              interaction_type NOT NULL DEFAULT 'lesson',
  user_message      text NOT NULL,                      -- Mensagem enviada pelo aluno
  bot_response      text NOT NULL,                      -- Resposta gerada pelo Koda
  intent            text,                               -- Intencao classificada pelo Haiku
  intent_confidence float,                              -- Confianca da classificacao (0.0 a 1.0)
  state             conversation_state_enum,            -- Estado FSM no momento da interacao
  xp_earned         int NOT NULL DEFAULT 0,             -- XP ganho nesta interacao
  ai_model          text,                               -- "sonnet" ou "haiku"
  tokens_in         int,                                -- Tokens de entrada consumidos
  tokens_out        int,                                -- Tokens de saida consumidos
  latency_ms        int,                                -- Latencia da chamada AI em ms
  metadata          jsonb DEFAULT '{}',                  -- Decisoes do Claude, dados extras
  created_at        timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE interactions IS 'Historico completo de mensagens — alto volume, considerar particao futura';
COMMENT ON COLUMN interactions.metadata IS 'JSON com decisoes do Claude: { "gate_passed": true, "next_state": "GATE_2" }';


-- ===== 3.7 GAMIFICATION — Badges, Conquistas e Marcos =====
-- Cada badge/conquista ganha pelo aluno.
CREATE TABLE gamification (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       gamification_type NOT NULL,                -- Tipo do evento
  name       text NOT NULL,                             -- Nome: "Primeiro Codigo", "Streak 7", etc
  earned_at  timestamptz NOT NULL DEFAULT now(),        -- Quando conquistou
  metadata   jsonb DEFAULT '{}',                        -- Dados extras: criterio, contexto

  -- Um aluno nao pode ganhar o mesmo badge 2x
  UNIQUE (user_id, type, name)
);

COMMENT ON TABLE gamification IS 'Eventos de gamificacao — badges, conquistas, marcos, level-ups';


-- ===== 3.8 CONVERSATION_STATE — Estado da FSM =====
-- Uma linha por aluno. Armazena o estado atual da conversa.
-- Atualizado a cada mensagem recebida.
CREATE TABLE conversation_state (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- 1:1 com users
  current_state  conversation_state_enum NOT NULL DEFAULT 'IDLE',
  context        jsonb DEFAULT '{}',                    -- { module_id, concept_id, gate, attempts, stack }
  updated_at     timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE conversation_state IS 'Estado atual da maquina de estados — uma linha por aluno (1:1)';
COMMENT ON COLUMN conversation_state.context IS 'JSON com contexto: { "module_id": 1, "concept_id": "uuid", "gate": 2, "attempts": 1, "stack": ["HUB"] }';

-- Trigger para updated_at automatico
CREATE TRIGGER set_conversation_state_updated_at
  BEFORE UPDATE ON conversation_state
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();


-- ===== 3.9 REENGAGEMENT_LOG — Log de Re-engajamento =====
-- Registra mensagens de re-engajamento enviadas para alunos inativos.
-- Usado pelo cron diario do sistema anti-abandono.
CREATE TABLE reengagement_log (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_number           int NOT NULL,                    -- Dia de inatividade (2, 3, 5, 7, 14, 30)
  template_used        text NOT NULL,                   -- Template: "quiz_invite", "streak_risk", etc
  sent_at              timestamptz NOT NULL DEFAULT now(),
  responded            boolean NOT NULL DEFAULT false,   -- Se o aluno respondeu
  response_delay_hours float                            -- Horas ate responder (NULL se nao respondeu)
);

COMMENT ON TABLE reengagement_log IS 'Log do sistema anti-abandono — mensagens proativas enviadas';


-- ===== 3.10 DIFFICULTY_SIGNALS — Sinais de Dificuldade Adaptativa =====
-- Um registro por (aluno, conceito). Rastreia sinais para adaptar dificuldade.
CREATE TABLE difficulty_signals (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  concept_id              uuid NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  accuracy_last_5         float,                        -- Acuracia dos ultimos 5 exercicios (0.0 a 1.0)
  avg_response_time       int,                          -- Tempo medio de resposta em ms
  frustration_indicators  int NOT NULL DEFAULT 0,       -- Contagem de sinais de frustracao
  current_difficulty      int NOT NULL DEFAULT 3 CHECK (current_difficulty BETWEEN 1 AND 5),
  adjusted_at             timestamptz NOT NULL DEFAULT now(),

  -- Um registro por aluno/conceito
  UNIQUE (user_id, concept_id)
);

COMMENT ON TABLE difficulty_signals IS 'Sinais de dificuldade adaptativa — zona de flow por aluno/conceito';

-- ----------------------------------------------------------------------------
-- 4. Indices
-- ----------------------------------------------------------------------------

-- === users ===
-- Busca por telefone ja coberta pelo UNIQUE constraint
-- Indice para cron de dropout risk e re-engajamento
CREATE INDEX idx_users_last_active_at ON users (last_active_at);
CREATE INDEX idx_users_dropout_risk ON users (dropout_risk_score);

-- === modules ===
-- Listagem ordenada do curriculo por fase e ordem
CREATE INDEX idx_modules_phase_order ON modules (phase, order_index);

-- === concepts ===
-- Listar conceitos de um modulo
CREATE INDEX idx_concepts_module_id ON concepts (module_id);

-- === progress ===
-- Listar todo progresso de um aluno
CREATE INDEX idx_progress_user_id ON progress (user_id);

-- === sessions ===
-- Listar sessoes de um aluno
CREATE INDEX idx_sessions_user_id ON sessions (user_id);
-- Buscar ultima sessao do aluno (mais recente primeiro)
CREATE INDEX idx_sessions_user_started ON sessions (user_id, started_at DESC);

-- === interactions ===
-- Listar interacoes de uma sessao
CREATE INDEX idx_interactions_session_id ON interactions (session_id);
-- Historico recente do aluno (para context builder)
CREATE INDEX idx_interactions_user_created ON interactions (user_id, created_at DESC);

-- === gamification ===
-- Listar badges de um aluno
CREATE INDEX idx_gamification_user_id ON gamification (user_id);

-- === reengagement_log ===
-- Verificar se ja enviou mensagem para esse dia de inatividade
CREATE INDEX idx_reengagement_user_day ON reengagement_log (user_id, day_number);

-- ----------------------------------------------------------------------------
-- 5. Row Level Security (RLS)
-- ----------------------------------------------------------------------------

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE reengagement_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE difficulty_signals ENABLE ROW LEVEL SECURITY;

-- ===== USERS =====
-- Aluno ve apenas seus proprios dados
CREATE POLICY "users_select_own"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Aluno atualiza apenas seus proprios dados
CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Insercao via service role (backend Hono cria usuario no primeiro contato)
CREATE POLICY "users_insert_service"
  ON users FOR INSERT
  WITH CHECK (true);
  -- NOTA: Em producao, restringir ao service role.
  -- O anon key nao deve conseguir criar usuarios diretamente.

-- ===== MODULES (leitura publica) =====
-- Qualquer usuario autenticado pode ler o curriculo
CREATE POLICY "modules_select_public"
  ON modules FOR SELECT
  USING (true);

-- ===== CONCEPTS (leitura publica) =====
-- Qualquer usuario autenticado pode ler os conceitos
CREATE POLICY "concepts_select_public"
  ON concepts FOR SELECT
  USING (true);

-- ===== PROGRESS =====
-- Aluno ve e edita apenas seu progresso
CREATE POLICY "progress_select_own"
  ON progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "progress_insert_own"
  ON progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "progress_update_own"
  ON progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ===== SESSIONS =====
-- Aluno ve e edita apenas suas sessoes
CREATE POLICY "sessions_select_own"
  ON sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "sessions_insert_own"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sessions_update_own"
  ON sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ===== INTERACTIONS =====
-- Aluno ve apenas suas interacoes (leitura)
CREATE POLICY "interactions_select_own"
  ON interactions FOR SELECT
  USING (auth.uid() = user_id);

-- Insercao via service role (backend insere apos processar mensagem)
CREATE POLICY "interactions_insert_service"
  ON interactions FOR INSERT
  WITH CHECK (true);

-- ===== GAMIFICATION =====
-- Aluno ve apenas suas conquistas
CREATE POLICY "gamification_select_own"
  ON gamification FOR SELECT
  USING (auth.uid() = user_id);

-- Insercao via service role (backend concede badges)
CREATE POLICY "gamification_insert_service"
  ON gamification FOR INSERT
  WITH CHECK (true);

-- ===== CONVERSATION_STATE =====
-- Aluno ve e edita apenas seu estado
CREATE POLICY "conversation_state_select_own"
  ON conversation_state FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "conversation_state_insert_own"
  ON conversation_state FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "conversation_state_update_own"
  ON conversation_state FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ===== REENGAGEMENT_LOG =====
-- Aluno pode ver seu log de re-engajamento
CREATE POLICY "reengagement_log_select_own"
  ON reengagement_log FOR SELECT
  USING (auth.uid() = user_id);

-- Insercao via service role (cron de re-engajamento)
CREATE POLICY "reengagement_log_insert_service"
  ON reengagement_log FOR INSERT
  WITH CHECK (true);

-- ===== DIFFICULTY_SIGNALS =====
-- Aluno ve e edita seus sinais de dificuldade
CREATE POLICY "difficulty_signals_select_own"
  ON difficulty_signals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "difficulty_signals_insert_own"
  ON difficulty_signals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "difficulty_signals_update_own"
  ON difficulty_signals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- FIM DA MIGRATION
-- ----------------------------------------------------------------------------
-- NOTA: O service role (SUPABASE_SERVICE_ROLE_KEY) bypassa RLS automaticamente.
-- O backend Hono usa service role para todas as operacoes administrativas:
-- criar usuarios, inserir interacoes, conceder badges, atualizar gamificacao.
--
-- O anon key (usado pelo Web App Next.js) respeita as policies acima,
-- garantindo que cada aluno so acessa seus proprios dados.
-- ============================================================================
