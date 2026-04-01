// Rota de health check do Koda
// Usada para verificar se o servidor está no ar

import { Hono } from 'hono'

const health = new Hono()

health.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
})

export { health }
