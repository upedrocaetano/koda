// Webhook da Evolution API — ponto de entrada de TODA comunicação do Koda
// Recebe mensagens do WhatsApp e processa de forma assíncrona

import { Hono } from 'hono'
import { logger } from '../utils/logger.js'
import { isDuplicate } from '../utils/idempotency.js'
import { processMessage as runPipeline } from '../core/pipeline.js'

const webhook = new Hono()

// Tipos de mensagem suportados
export type MessageType = 'text' | 'audio' | 'image' | 'unknown'

// Payload parseado do webhook
export interface ParsedMessage {
  phone: string
  messageId: string
  text: string | null
  messageType: MessageType
  rawPayload: unknown
}

/**
 * Extrai dados relevantes do payload do webhook Evolution.
 */
export function parseEvolutionPayload(body: Record<string, unknown>): ParsedMessage | null {
  const data = body.data as Record<string, unknown> | undefined
  if (!data) return null

  const key = data.key as Record<string, unknown> | undefined
  const message = data.message as Record<string, unknown> | undefined

  if (!key || !message) return null

  // Extrair phone (remover @s.whatsapp.net)
  const remoteJid = key.remoteJid as string | undefined
  if (!remoteJid) return null
  const phone = remoteJid.replace('@s.whatsapp.net', '')

  // Extrair messageId
  const messageId = key.id as string | undefined
  if (!messageId) return null

  // Extrair texto (pode vir de 2 formatos diferentes)
  const text = (message.conversation as string | undefined)
    ?? (message.extendedTextMessage as Record<string, unknown> | undefined)?.text as string | undefined
    ?? null

  // Detectar tipo de mensagem
  let messageType: MessageType = 'unknown'
  if (message.conversation || message.extendedTextMessage) {
    messageType = 'text'
  } else if (message.audioMessage) {
    messageType = 'audio'
  } else if (message.imageMessage) {
    messageType = 'image'
  }

  return {
    phone,
    messageId,
    text,
    messageType,
    rawPayload: body,
  }
}

/**
 * Processa a mensagem recebida via pipeline de 10 etapas.
 */
async function processMessage(parsed: ParsedMessage): Promise<void> {
  logger.info('Processando mensagem via pipeline', {
    phone: parsed.phone,
    type: parsed.messageType,
    messageId: parsed.messageId,
  })

  await runPipeline({
    phone: parsed.phone,
    text: parsed.text,
    messageType: parsed.messageType,
    messageId: parsed.messageId,
    rawPayload: parsed.rawPayload,
  })
}

// POST /webhook/evolution — recebe mensagens do WhatsApp
webhook.post('/webhook/evolution', async (c) => {
  // AC9: Validar API key
  const webhookSecret = process.env.EVOLUTION_WEBHOOK_SECRET
  if (webhookSecret) {
    const apikey = c.req.header('apikey')
    if (apikey !== webhookSecret) {
      logger.warn('Webhook rejeitado: API key inválida')
      return c.json({ error: 'Unauthorized' }, 401)
    }
  }

  const body = await c.req.json() as Record<string, unknown>

  // AC2: Filtrar apenas eventos messages.upsert
  const event = body.event as string | undefined
  if (event !== 'messages.upsert') {
    return c.json({ ok: true })
  }

  // AC3: Ignorar mensagens do próprio bot
  const data = body.data as Record<string, unknown> | undefined
  const key = data?.key as Record<string, unknown> | undefined
  if (key?.fromMe === true) {
    return c.json({ ok: true })
  }

  // AC4: Parsing do payload
  const parsed = parseEvolutionPayload(body)
  if (!parsed) {
    logger.warn('Payload inválido — não foi possível extrair dados', { body })
    return c.json({ ok: true })
  }

  // AC6: Verificar idempotência
  if (isDuplicate(parsed.messageId)) {
    logger.info('Mensagem duplicada ignorada', { messageId: parsed.messageId })
    return c.json({ ok: true, duplicate: true })
  }

  // AC10: Responder 200 imediatamente e processar async
  // AC11: Erros no processamento são logados mas não retornados
  processMessage(parsed).catch((error) => {
    logger.error('Erro ao processar mensagem', {
      messageId: parsed.messageId,
      phone: parsed.phone,
      error: error instanceof Error ? error.message : String(error),
    })
  })

  return c.json({ ok: true })
})

export { webhook }
