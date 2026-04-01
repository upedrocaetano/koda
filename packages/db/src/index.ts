// @koda/db — Schema, queries e cliente Supabase

export { getSupabase, supabase } from './client.js'

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
} from './schema.js'

// Queries
export { findUserByPhone, updateUserProfile } from './queries/users.js'
export { awardXP } from './queries/gamification.js'
export { getState, setState } from './queries/conversation-state.js'
