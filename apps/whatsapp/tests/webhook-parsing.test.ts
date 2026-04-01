// Testes do parsing de payload do webhook Evolution
// AC12: 3 cenários — texto simples, extendedTextMessage, áudio

import { describe, it, expect } from 'vitest'
import { parseEvolutionPayload } from '../src/routes/webhook.js'

describe('parseEvolutionPayload', () => {
  it('parseia mensagem de texto simples (conversation)', () => {
    const payload = {
      event: 'messages.upsert',
      data: {
        key: {
          remoteJid: '5511999999999@s.whatsapp.net',
          fromMe: false,
          id: 'MSG001',
        },
        message: {
          conversation: 'Oi Koda, quero aprender programação!',
        },
      },
    }

    const result = parseEvolutionPayload(payload)

    expect(result).not.toBeNull()
    expect(result!.phone).toBe('5511999999999')
    expect(result!.messageId).toBe('MSG001')
    expect(result!.text).toBe('Oi Koda, quero aprender programação!')
    expect(result!.messageType).toBe('text')
  })

  it('parseia mensagem com formatação (extendedTextMessage)', () => {
    const payload = {
      event: 'messages.upsert',
      data: {
        key: {
          remoteJid: '5521888888888@s.whatsapp.net',
          fromMe: false,
          id: 'MSG002',
        },
        message: {
          extendedTextMessage: {
            text: '*Olá!* Quero ver meu _progresso_',
          },
        },
      },
    }

    const result = parseEvolutionPayload(payload)

    expect(result).not.toBeNull()
    expect(result!.phone).toBe('5521888888888')
    expect(result!.messageId).toBe('MSG002')
    expect(result!.text).toBe('*Olá!* Quero ver meu _progresso_')
    expect(result!.messageType).toBe('text')
  })

  it('parseia mensagem de áudio (audioMessage)', () => {
    const payload = {
      event: 'messages.upsert',
      data: {
        key: {
          remoteJid: '5531777777777@s.whatsapp.net',
          fromMe: false,
          id: 'MSG003',
        },
        message: {
          audioMessage: {
            mimetype: 'audio/ogg; codecs=opus',
            seconds: 15,
          },
        },
      },
    }

    const result = parseEvolutionPayload(payload)

    expect(result).not.toBeNull()
    expect(result!.phone).toBe('5531777777777')
    expect(result!.messageId).toBe('MSG003')
    expect(result!.text).toBeNull()
    expect(result!.messageType).toBe('audio')
  })

  it('parseia mensagem de imagem (imageMessage)', () => {
    const payload = {
      event: 'messages.upsert',
      data: {
        key: {
          remoteJid: '5541666666666@s.whatsapp.net',
          fromMe: false,
          id: 'MSG004',
        },
        message: {
          imageMessage: {
            mimetype: 'image/jpeg',
            caption: 'meu código',
          },
        },
      },
    }

    const result = parseEvolutionPayload(payload)

    expect(result).not.toBeNull()
    expect(result!.messageType).toBe('image')
    expect(result!.text).toBeNull()
  })

  it('retorna null para payload inválido', () => {
    expect(parseEvolutionPayload({})).toBeNull()
    expect(parseEvolutionPayload({ data: {} })).toBeNull()
    expect(parseEvolutionPayload({ data: { key: {} } })).toBeNull()
  })
})
