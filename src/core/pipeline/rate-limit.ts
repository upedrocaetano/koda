// Etapa 3 — Rate Limit
// Verifica se usuário enviou < 10 msgs no último minuto (in-memory counter)

const counters = new Map<string, { count: number; resetAt: number }>()
const MAX_MESSAGES_PER_MINUTE = 10
const WINDOW_MS = 60_000

export interface RateLimitResult {
  limited: boolean
  message?: string
}

export function rateLimit(phone: string): RateLimitResult {
  const now = Date.now()
  const entry = counters.get(phone)

  if (!entry || now >= entry.resetAt) {
    counters.set(phone, { count: 1, resetAt: now + WINDOW_MS })
    return { limited: false }
  }

  entry.count++

  if (entry.count > MAX_MESSAGES_PER_MINUTE) {
    return {
      limited: true,
      message: 'Calma, estou processando sua mensagem anterior... 😊 Espera só um pouquinho!',
    }
  }

  return { limited: false }
}

// Cleanup periódico (a cada 2 minutos)
setInterval(() => {
  const now = Date.now()
  for (const [phone, entry] of counters) {
    if (now >= entry.resetAt) {
      counters.delete(phone)
    }
  }
}, 120_000)
