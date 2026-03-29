// Etapa 1 — Receive & Parse
// Normaliza input bruto: trim, limit 2000 chars, detecta tipo de mídia

export interface ParsedInput {
  text: string
  messageType: 'text' | 'audio' | 'image' | 'unknown'
  isMedia: boolean
}

export function receive(input: {
  text: string | null
  messageType: string
}): ParsedInput {
  let text = input.text ?? ''

  // Normalizar texto
  text = text.trim()
  if (text.length > 2000) {
    text = text.substring(0, 2000)
  }

  const messageType = input.messageType as ParsedInput['messageType']
  const isMedia = messageType === 'audio' || messageType === 'image'

  // Se áudio, placeholder até Whisper ser implementado
  if (messageType === 'audio' && !text) {
    text = '[áudio recebido — transcrição será implementada em breve]'
  }

  // Se imagem sem caption
  if (messageType === 'image' && !text) {
    text = '[imagem recebida]'
  }

  return { text, messageType, isMedia }
}
