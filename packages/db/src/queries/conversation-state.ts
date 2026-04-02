// Queries para tabela conversation_state

import { supabase } from '../client'
import type { ConversationState } from '../schema'

export async function getState(userId: string): Promise<ConversationState | null> {
  const { data, error } = await supabase
    .from('conversation_state')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Erro ao buscar estado: ${error.message}`)
  }

  return data as ConversationState
}

export async function setState(
  userId: string,
  state: string,
  context: object,
): Promise<void> {
  const { error } = await supabase
    .from('conversation_state')
    .upsert(
      {
        user_id: userId,
        current_state: state,
        context,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )

  if (error) {
    throw new Error(`Erro ao salvar estado: ${error.message}`)
  }
}
