// Testes do classificador de intenção (Story 1.5)
// Mock do Claude para testar parsing e fallback

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock do módulo claude ANTES de importar o classifier
vi.mock('../src/services/claude.js', () => ({
  claude: {
    messages: {
      create: vi.fn(),
    },
  },
}))

import { classifyIntent } from '../src/core/classifier.js'
import { claude } from '../src/services/claude.js'

const mockCreate = claude.messages.create as ReturnType<typeof vi.fn>

function mockResponse(text: string) {
  mockCreate.mockResolvedValueOnce({
    content: [{ type: 'text', text }],
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('classifyIntent', () => {
  it('classifica saudação ("oi")', async () => {
    mockResponse('{"intent": "greeting", "confidence": 0.95}')
    const result = await classifyIntent('oi', 'HUB')
    expect(result.intent).toBe('greeting')
    expect(result.confidence).toBe(0.95)
  })

  it('classifica continuação ("vamos lá")', async () => {
    mockResponse('{"intent": "lesson_continue", "confidence": 0.90}')
    const result = await classifyIntent('vamos lá', 'HUB')
    expect(result.intent).toBe('lesson_continue')
    expect(result.confidence).toBe(0.90)
  })

  it('classifica dúvida ("o que é variável?")', async () => {
    mockResponse('{"intent": "doubt", "confidence": 0.88}')
    const result = await classifyIntent('o que é variável?', 'LESSON')
    expect(result.intent).toBe('doubt')
    expect(result.confidence).toBe(0.88)
  })

  it('classifica código ("function soma(){}")', async () => {
    mockResponse('{"intent": "code_submission", "confidence": 0.92}')
    const result = await classifyIntent('function soma(a, b) { return a + b }', 'LESSON')
    expect(result.intent).toBe('code_submission')
    expect(result.confidence).toBe(0.92)
  })

  it('classifica humor ("cansei")', async () => {
    mockResponse('{"intent": "mood_check", "confidence": 0.85}')
    const result = await classifyIntent('cansei, tô cansado', 'LESSON')
    expect(result.intent).toBe('mood_check')
    expect(result.confidence).toBe(0.85)
  })

  it('retorna unknown quando confiança < 0.5', async () => {
    mockResponse('{"intent": "greeting", "confidence": 0.3}')
    const result = await classifyIntent('hmm', 'HUB')
    expect(result.intent).toBe('unknown')
    expect(result.confidence).toBe(0.3)
  })

  it('retorna unknown quando Claude falha', async () => {
    mockCreate.mockRejectedValueOnce(new Error('API timeout'))
    const result = await classifyIntent('oi', 'HUB')
    expect(result.intent).toBe('unknown')
    expect(result.confidence).toBe(0)
  })

  it('retorna unknown para formato inválido', async () => {
    mockResponse('Não consigo classificar essa mensagem')
    const result = await classifyIntent('...', 'HUB')
    expect(result.intent).toBe('unknown')
    expect(result.confidence).toBe(0)
  })
})
