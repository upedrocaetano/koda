// Cliente Supabase do Koda
// Usa service_role_key para bypasear RLS no backend
// NUNCA expor essa chave no frontend

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias. ' +
        'Verifique o arquivo .env'
      )
    }

    _supabase = createClient(supabaseUrl, supabaseKey)
  }
  return _supabase
}

// Re-export como getter para manter compatibilidade com imports existentes
// Uso: import { supabase } from '...' → supabase.from('table')
// O Proxy delega todas as chamadas para a instância lazy
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop]
  },
})
