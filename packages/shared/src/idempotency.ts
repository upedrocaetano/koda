// Cache de idempotência para evitar processar mensagens duplicadas

const DEFAULT_TTL_MS = 5 * 60 * 1000 // 5 minutos
const CLEANUP_INTERVAL_MS = 60 * 1000 // limpar a cada 1 minuto

const cache = new Map<string, number>()

/**
 * Verifica se um messageId já foi processado.
 * Retorna true se é duplicado (já processado).
 */
export function isDuplicate(messageId: string): boolean {
  const expiry = cache.get(messageId)
  if (expiry && expiry > Date.now()) {
    return true
  }
  cache.set(messageId, Date.now() + DEFAULT_TTL_MS)
  return false
}

// Limpeza periódica de entradas expiradas
setInterval(() => {
  const now = Date.now()
  for (const [key, expiry] of cache) {
    if (expiry <= now) {
      cache.delete(key)
    }
  }
}, CLEANUP_INTERVAL_MS)
