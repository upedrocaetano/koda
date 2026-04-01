// Serviço de integração com Evolution API (WhatsApp)
// Envia mensagens e indicadores de digitação

import { logger } from '../utils/logger.js'

const apiUrl = process.env.EVOLUTION_API_URL
const apiKey = process.env.EVOLUTION_API_KEY
const instance = process.env.EVOLUTION_INSTANCE

// Limite prático de caracteres por mensagem no WhatsApp
const MAX_MESSAGE_LENGTH = 2000

/**
 * Envia uma mensagem de texto via WhatsApp.
 * Quebra textos longos em múltiplas mensagens.
 */
export async function sendMessage(phone: string, text: string): Promise<void> {
  if (!apiUrl || !apiKey || !instance) {
    throw new Error('Variáveis EVOLUTION_API_URL, EVOLUTION_API_KEY e EVOLUTION_INSTANCE são obrigatórias')
  }

  // Quebrar em múltiplas mensagens se necessário
  const chunks = splitMessage(text, MAX_MESSAGE_LENGTH)

  for (const chunk of chunks) {
    const response = await fetch(`${apiUrl}/message/sendText/${instance}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
      },
      body: JSON.stringify({
        number: phone,
        text: chunk,
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      logger.error('Falha ao enviar mensagem via Evolution', {
        phone,
        status: response.status,
        body,
      })
      throw new Error(`Evolution API erro ${response.status}: ${body}`)
    }
  }
}

/**
 * Envia indicador "digitando..." para melhorar UX.
 * Enviar ANTES de processar a resposta.
 */
export async function sendTypingIndicator(phone: string): Promise<void> {
  if (!apiUrl || !apiKey || !instance) return

  try {
    await fetch(`${apiUrl}/chat/presence/${instance}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
      },
      body: JSON.stringify({
        number: phone,
        presence: 'composing',
      }),
    })
  } catch (error) {
    // Não falhar se typing indicator der erro — é cosmético
    logger.warn('Falha ao enviar typing indicator', { phone, error: String(error) })
  }
}

/**
 * Quebra texto longo em pedaços respeitando quebras de linha.
 */
function splitMessage(text: string, maxLength: number): string[] {
  if (text.length <= maxLength) return [text]

  const chunks: string[] = []
  let remaining = text

  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      chunks.push(remaining)
      break
    }

    // Tentar quebrar na última quebra de linha antes do limite
    let splitIndex = remaining.lastIndexOf('\n', maxLength)
    if (splitIndex === -1 || splitIndex < maxLength * 0.5) {
      // Se não encontrou quebra de linha boa, quebrar no último espaço
      splitIndex = remaining.lastIndexOf(' ', maxLength)
    }
    if (splitIndex === -1 || splitIndex < maxLength * 0.5) {
      // Último recurso: cortar no limite
      splitIndex = maxLength
    }

    chunks.push(remaining.slice(0, splitIndex))
    remaining = remaining.slice(splitIndex).trimStart()
  }

  return chunks
}
