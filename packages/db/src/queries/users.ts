// Queries relacionadas à tabela users

import { supabase } from '../client.js'
import type { User } from '../schema.js'

export async function findUserByPhone(phone: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('phone', phone)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Erro ao buscar usuario por phone: ${error.message}`)
  }

  return data as User
}

export async function updateUserProfile(
  userId: string,
  data: Partial<User>,
): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) {
    throw new Error(`Erro ao atualizar perfil: ${error.message}`)
  }
}
