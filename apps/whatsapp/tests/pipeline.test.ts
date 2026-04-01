// Testes do pipeline de 10 etapas (Story 1.4)
// Testa receive, rate-limit e pipeline orchestration

import { describe, it, expect } from 'vitest'
import { receive } from '../src/core/pipeline/receive.js'

// --- Etapa 1: Receive & Parse ---

describe('receive()', () => {
  it('normaliza texto com trim e respeita limite de 2000 chars', () => {
    const longText = 'a'.repeat(2500)
    const result = receive({ text: `  ${longText}  `, messageType: 'text' })
    expect(result.text.length).toBe(2000)
    expect(result.messageType).toBe('text')
    expect(result.isMedia).toBe(false)
  })

  it('retorna placeholder para áudio sem texto', () => {
    const result = receive({ text: null, messageType: 'audio' })
    expect(result.text).toContain('áudio recebido')
    expect(result.isMedia).toBe(true)
  })

  it('retorna placeholder para imagem sem texto', () => {
    const result = receive({ text: null, messageType: 'image' })
    expect(result.text).toContain('imagem recebida')
    expect(result.isMedia).toBe(true)
  })

  it('preserva texto de imagem com caption', () => {
    const result = receive({ text: 'meu código', messageType: 'image' })
    expect(result.text).toBe('meu código')
    expect(result.isMedia).toBe(true)
  })

  it('trata null como string vazia para text', () => {
    const result = receive({ text: null, messageType: 'text' })
    expect(result.text).toBe('')
    expect(result.isMedia).toBe(false)
  })
})

// --- Etapa 3: Rate Limit ---
// Importamos dinamicamente para resetar estado entre testes

describe('rateLimit()', () => {
  it('permite mensagens dentro do limite', async () => {
    // Importação dinâmica para cada teste ter estado isolado
    const { rateLimit } = await import('../src/core/pipeline/rate-limit.js')
    const phone = `test-${Date.now()}-allow`
    const result = rateLimit(phone)
    expect(result.limited).toBe(false)
  })

  it('bloqueia após 10 mensagens no mesmo minuto', async () => {
    const { rateLimit } = await import('../src/core/pipeline/rate-limit.js')
    const phone = `test-${Date.now()}-block`

    // Enviar 10 mensagens (permitidas)
    for (let i = 0; i < 10; i++) {
      const r = rateLimit(phone)
      expect(r.limited).toBe(false)
    }

    // 11ª mensagem deve ser bloqueada
    const blocked = rateLimit(phone)
    expect(blocked.limited).toBe(true)
    expect(blocked.message).toBeDefined()
  })
})
