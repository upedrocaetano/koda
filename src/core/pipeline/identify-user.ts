// Etapa 2 — Identify User
// Busca usuário por phone no Supabase. Se não existe, cria com defaults.

import { supabase } from '../../services/supabase.js'
import type { User } from '../../db/schema.js'

export interface IdentifiedUser extends User {
  isNew: boolean
}

export async function identifyUser(phone: string): Promise<IdentifiedUser> {
  // Tentar buscar usuário existente
  const { data: existing, error: findError } = await supabase
    .from('users')
    .select('*')
    .eq('phone', phone)
    .single()

  if (existing && !findError) {
    // Atualizar last_active_at
    await supabase
      .from('users')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', existing.id)

    return { ...(existing as User), isNew: false }
  }

  // Criar novo usuário
  const { data: newUser, error: createError } = await supabase
    .from('users')
    .insert({
      phone,
      last_active_at: new Date().toISOString(),
    })
    .select('*')
    .single()

  if (createError || !newUser) {
    throw new Error(`Falha ao criar usuário: ${createError?.message}`)
  }

  return { ...(newUser as User), isNew: true }
}
