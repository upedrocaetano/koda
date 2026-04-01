// Cliente Supabase do Koda
// Factory que cria client server-side (service_role) ou browser-side (anon key)

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _serverClient: SupabaseClient | null = null

/**
 * Retorna o Supabase client server-side (service_role — bypassa RLS).
 * NUNCA expor no frontend.
 */
export function getSupabase(): SupabaseClient {
  if (!_serverClient) {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias. ' +
        'Verifique o arquivo .env'
      )
    }

    _serverClient = createClient(supabaseUrl, supabaseKey)
  }
  return _serverClient
}

// Proxy para manter compatibilidade com `import { supabase } from '...'`
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop]
  },
})
