// Queries relacionadas à tabela users
// Usa o cliente Supabase com service_role_key (bypassa RLS)

import { supabase } from '../../services/supabase.js'
import type { User } from '../schema.js'

/**
 * Busca usuario pelo numero de telefone.
 * Retorna null se nao encontrado.
 */
export async function findUserByPhone(phone: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('phone', phone)
    .single()

  if (error) {
    // PGRST116 = "No rows found" — esperado para usuarios novos
    if (error.code === 'PGRST116') return null
    throw new Error(`Erro ao buscar usuario por phone: ${error.message}`)
  }

  return data as User
}

/**
 * Atualiza campos do perfil do usuario.
 * Aceita qualquer subconjunto de campos do User.
 */
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
