// Tipos TypeScript que espelham o schema Supabase do Koda
// Gerado a partir de: supabase/migrations/00001_initial_schema.sql

// ============================================================================
// Enums
// ============================================================================

export type UserLevel =
  | 'beginner'
  | 'basic_html'
  | 'knows_js'
  | 'knows_ts'
  | 'backend_ready'
  | 'fullstack'
  | 'saas_builder'
  | 'master'

export type GateType = 'comprehension' | 'practice' | 'application'

export type InteractionType =
  | 'lesson'
  | 'quiz'
  | 'code_challenge'
  | 'ache_o_bug'
  | 'ordene_as_linhas'
  | 'boss_fight'
  | 'revisao'
  | 'code_reading'
  | 'speed_coding'
  | 'doubt'
  | 'feedback'
  | 'system'

export type ConversationStateEnum =
  | 'IDLE'
  | 'ONBOARDING'
  | 'HUB'
  | 'LESSON'
  | 'GATE_1'
  | 'GATE_2'
  | 'GATE_3'
  | 'QUIZ'
  | 'DOUBT'
  | 'BREAK'
  | 'REVIEW'
  | 'PLAYGROUND'

export type MoodType = 'focused' | 'relaxed' | 'tired' | 'frustrated'

export type GamificationType = 'badge' | 'achievement' | 'milestone' | 'level_up'

// ============================================================================
// Tabelas
// ============================================================================

export interface User {
  id: string
  phone: string
  name: string | null
  objective: string | null
  level: UserLevel
  daily_availability: number | null
  timezone: string
  total_xp: number
  current_streak: number
  max_streak: number
  dropout_risk_score: number | null
  mood: MoodType | null
  onboarding_completed: boolean
  preferred_study_time: string | null
  notification_enabled: boolean
  preferences: Record<string, unknown>
  last_active_at: string | null
  created_at: string
  updated_at: string
}

export interface Module {
  id: number
  name: string
  description: string | null
  phase: number
  order_index: number
  prerequisites: number[]
  concepts_count: number
  estimated_hours: number | null
  difficulty: number | null
  created_at: string
}

export interface Concept {
  id: string
  module_id: number
  name: string
  description: string | null
  order_index: number
  gate_type: GateType
  difficulty_level: number
  created_at: string
}

export interface Progress {
  id: string
  user_id: string
  concept_id: string
  gate_1_passed: boolean
  gate_2_passed: boolean
  gate_3_passed: boolean
  attempts: number
  xp_earned: number
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface Session {
  id: string
  user_id: string
  started_at: string
  ended_at: string | null
  messages_count: number
  xp_earned: number
  mood_start: MoodType | null
  mood_end: MoodType | null
  state: ConversationStateEnum
  created_at: string
}

export interface Interaction {
  id: string
  session_id: string
  user_id: string
  type: InteractionType
  user_message: string
  bot_response: string
  intent: string | null
  intent_confidence: number | null
  state: ConversationStateEnum | null
  xp_earned: number
  ai_model: string | null
  tokens_in: number | null
  tokens_out: number | null
  latency_ms: number | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface Gamification {
  id: string
  user_id: string
  type: GamificationType
  name: string
  earned_at: string
  metadata: Record<string, unknown>
}

export interface ConversationState {
  id: string
  user_id: string
  current_state: ConversationStateEnum
  context: Record<string, unknown>
  updated_at: string
}

export interface ReengagementLog {
  id: string
  user_id: string
  day_number: number
  template_used: string
  sent_at: string
  responded: boolean
  response_delay_hours: number | null
}

export interface DifficultySignal {
  id: string
  user_id: string
  concept_id: string
  accuracy_last_5: number | null
  avg_response_time: number | null
  frustration_indicators: number
  current_difficulty: number
  adjusted_at: string
}
