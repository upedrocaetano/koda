// @koda/db — Schema, queries e cliente Supabase

export { getSupabase, supabase } from './client'

// Schema types
export type {
  User,
  Module,
  Concept,
  Progress,
  Session,
  Interaction,
  Gamification,
  ConversationState,
  ReengagementLog,
  DifficultySignal,
  UserLevel,
  GateType,
  InteractionType,
  ConversationStateEnum,
  MoodType,
  GamificationType,
} from './schema'

// Queries
export { findUserByPhone, updateUserProfile } from './queries/users'
export { awardXP } from './queries/gamification'
export { getState, setState } from './queries/conversation-state'
