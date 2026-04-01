// Koda — Professor de programação via WhatsApp com IA
// Entry point: servidor Hono rodando em Node.js

import 'dotenv/config'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { logger } from './utils/logger.js'
import { health } from './routes/health.js'
import { webhook } from './routes/webhook.js'

const app = new Hono()

// Rotas
app.route('/', health)
app.route('/', webhook)

// Iniciar servidor
const port = Number(process.env.PORT) || 3333

serve({ fetch: app.fetch, port }, () => {
  logger.info('Koda backend iniciado', { port })
})

export { app }
