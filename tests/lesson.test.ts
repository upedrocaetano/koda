// Testes do módulo de aula (Story 1.8)
// Mock do Claude e Supabase para testar lesson handler e gate evaluator

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock do Claude
vi.mock('../src/services/claude.js', () => ({
  claude: {
    messages: {
      create: vi.fn(),
    },
  },
}))

// Mock do Supabase
vi.mock('../src/services/supabase.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          })),
          order: vi.fn(() => ({
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
          })),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
      })),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
    })),
  },
}))

// Mock do setState
vi.mock('../src/db/queries/conversation-state.js', () => ({
  setState: vi.fn().mockResolvedValue(undefined),
  getState: vi.fn().mockResolvedValue(null),
}))

// Mock do logger
vi.mock('../src/utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

import { handleLesson, type LessonResult } from '../src/modules/lesson/handler.js'
import { evaluateGate, type GateResult } from '../src/modules/lesson/gate-evaluator.js'
import { claude } from '../src/services/claude.js'
import type { User, ConversationState } from '../src/db/schema.js'

const mockCreate = claude.messages.create as ReturnType<typeof vi.fn>

function mockClaudeResponse(text: string) {
  mockCreate.mockResolvedValueOnce({
    content: [{ type: 'text', text }],
  })
}

const mockUser: User = {
  id: 'user-123',
  phone: '5511999999999',
  name: 'Pedro',
  level: 'beginner',
  objective: 'aprender programação',
  total_xp: 0,
  current_streak: 1,
  mood: 'motivado',
  onboarding_completed: true,
  daily_availability: 30,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  last_active_at: new Date().toISOString(),
}

function makeState(currentState: string, context: Record<string, unknown> = {}): ConversationState {
  return {
    id: 'state-123',
    user_id: 'user-123',
    current_state: currentState,
    context,
    updated_at: new Date().toISOString(),
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ── Gate Evaluator Tests ──

describe('evaluateGate', () => {
  it('Gate 1: aprova quando aluno demonstra compreensão (+30 XP)', async () => {
    mockClaudeResponse('{"passed": true, "feedback": "Mandou bem! Entendeu direitinho! 🎉"}')

    const result = await evaluateGate(
      1,
      'Variável é tipo uma caixa onde eu guardo um valor',
      { id: 'variaveis', name: 'Variáveis', key_points: ['guarda valor na memória'] },
      makeState('GATE_1', { gateAttempts: 0 }),
    )

    expect(result.passed).toBe(true)
    expect(result.xpEarned).toBe(30)
    expect(result.passedWithHelp).toBe(false)
    expect(result.attemptsUsed).toBe(1)
  })

  it('Gate 1: reprova quando aluno não demonstra compreensão', async () => {
    mockClaudeResponse('{"passed": false, "feedback": "Quase! Tenta pensar como uma caixa com etiqueta 📦"}')

    const result = await evaluateGate(
      1,
      'não sei',
      { id: 'variaveis', name: 'Variáveis', key_points: ['guarda valor na memória'] },
      makeState('GATE_1', { gateAttempts: 0 }),
    )

    expect(result.passed).toBe(false)
    expect(result.xpEarned).toBe(0)
    expect(result.feedback).toContain('Quase')
  })

  it('Gate 2: aprova na 1ª tentativa (+50 XP)', async () => {
    mockClaudeResponse('{"passed": true, "feedback": "Código perfeito! 🚀"}')

    const result = await evaluateGate(
      2,
      'let nome = "Pedro"\nlet idade = 25',
      { id: 'variaveis', name: 'Variáveis', key_points: [], exercise: 'Crie variáveis', solution: 'let nome = ...' },
      makeState('GATE_2', { gateAttempts: 0 }),
    )

    expect(result.passed).toBe(true)
    expect(result.xpEarned).toBe(50)
    expect(result.attemptsUsed).toBe(1)
  })

  it('Gate 2: aprova na 2ª tentativa (+40 XP)', async () => {
    mockClaudeResponse('{"passed": true, "feedback": "Agora sim! 💪"}')

    const result = await evaluateGate(
      2,
      'let nome = "Pedro"',
      { id: 'variaveis', name: 'Variáveis', key_points: [], exercise: 'Crie variáveis', solution: 'let nome = ...' },
      makeState('GATE_2', { gateAttempts: 1 }),
    )

    expect(result.passed).toBe(true)
    expect(result.xpEarned).toBe(40)
    expect(result.attemptsUsed).toBe(2)
  })

  it('Gate 2: após 3 falhas, marca passedWithHelp (+25 XP)', async () => {
    mockClaudeResponse('{"passed": false, "feedback": "Olha a solução:", "show_solution": true}')

    const result = await evaluateGate(
      2,
      'x = 1',
      { id: 'variaveis', name: 'Variáveis', key_points: [], exercise: 'Crie variáveis', solution: 'let nome = ...' },
      makeState('GATE_2', { gateAttempts: 2 }),
    )

    expect(result.passed).toBe(true)
    expect(result.passedWithHelp).toBe(true)
    expect(result.xpEarned).toBe(25)
    expect(result.attemptsUsed).toBe(3)
  })

  it('retorna fallback quando Claude não retorna JSON', async () => {
    mockClaudeResponse('Não consegui avaliar')

    const result = await evaluateGate(
      1,
      'sei lá',
      { id: 'variaveis', name: 'Variáveis', key_points: ['valor na memória'] },
      makeState('GATE_1', { gateAttempts: 0 }),
    )

    expect(result.passed).toBe(false)
    expect(result.feedback).toContain('me perdi')
    expect(result.xpEarned).toBe(0)
  })

  it('retorna fallback quando Claude lança erro', async () => {
    mockCreate.mockRejectedValueOnce(new Error('API timeout'))

    const result = await evaluateGate(
      1,
      'variável guarda valor',
      { id: 'variaveis', name: 'Variáveis', key_points: ['valor na memória'] },
      makeState('GATE_1', { gateAttempts: 0 }),
    )

    expect(result.passed).toBe(false)
    expect(result.xpEarned).toBe(0)
  })
})

// ── Lesson Handler Tests ──

describe('handleLesson', () => {
  it('retorna LessonResult com responseText e decisions', async () => {
    mockClaudeResponse(JSON.stringify({
      response_text: 'Variável é como uma caixa! 📦',
      decisions: {
        gate_passed: null,
        xp_earned: 0,
        next_state: 'LESSON',
        mastery_update: null,
        concept_id: 'variaveis',
      },
    }))

    const result = await handleLesson(
      mockUser,
      'me explica variáveis',
      makeState('LESSON', { currentConceptId: 'variaveis' }),
    )

    expect(result).toHaveProperty('responseText')
    expect(result).toHaveProperty('decisions')
    expect(result.decisions).toHaveProperty('gate_passed')
    expect(result.decisions).toHaveProperty('xp_earned')
    expect(result.decisions).toHaveProperty('next_state')
    expect(result.decisions).toHaveProperty('concept_id')
  })

  it('conceito padrão é "variaveis" quando sem currentConceptId', async () => {
    mockClaudeResponse(JSON.stringify({
      response_text: 'Vamos aprender variáveis!',
      decisions: { concept_id: 'variaveis', next_state: 'LESSON' },
    }))

    const result = await handleLesson(
      mockUser,
      'vamos começar',
      makeState('LESSON', {}),
    )

    expect(result.decisions.concept_id).toBe('variaveis')
  })

  it('retorna parabéns quando conceito não existe (módulo completo)', async () => {
    const result = await handleLesson(
      mockUser,
      'próximo',
      makeState('LESSON', { currentConceptId: 'conceito-inexistente' }),
    )

    expect(result.responseText).toContain('Parabéns')
    expect(result.decisions.next_state).toBe('HUB')
  })

  it('usa Claude Sonnet no estado LESSON', async () => {
    mockClaudeResponse(JSON.stringify({
      response_text: 'Variáveis são como caixas!',
      decisions: { next_state: 'LESSON' },
    }))

    await handleLesson(
      mockUser,
      'o que é variável?',
      makeState('LESSON', { currentConceptId: 'variaveis' }),
    )

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
      }),
    )
  })

  it('retorna mensagem de timeout quando Claude demora', async () => {
    const abortError = new Error('Aborted')
    abortError.name = 'AbortError'
    mockCreate.mockRejectedValueOnce(abortError)

    const result = await handleLesson(
      mockUser,
      'me explica',
      makeState('LESSON', { currentConceptId: 'variaveis' }),
    )

    expect(result.responseText).toContain('demorei')
    expect(result.decisions.xp_earned).toBe(0)
  })

  it('retorna mensagem de erro genérica quando Claude falha', async () => {
    mockCreate.mockRejectedValueOnce(new Error('API error'))

    const result = await handleLesson(
      mockUser,
      'me explica',
      makeState('LESSON', { currentConceptId: 'variaveis' }),
    )

    expect(result.responseText).toContain('problema')
    expect(result.decisions.xp_earned).toBe(0)
  })

  it('no estado GATE_1, usa evaluateGate ao invés de Claude direto', async () => {
    // Gate evaluator vai chamar Claude
    mockClaudeResponse('{"passed": true, "feedback": "Excelente! 🎉"}')

    const result = await handleLesson(
      mockUser,
      'variável guarda valor na memória com um nome',
      makeState('GATE_1', { currentConceptId: 'variaveis', gateAttempts: 0 }),
    )

    expect(result.decisions.gate_passed).toBe(true)
    expect(result.decisions.xp_earned).toBe(30)
  })

  it('no estado GATE_2, avalia exercício de código', async () => {
    mockClaudeResponse('{"passed": true, "feedback": "Código correto! 🚀"}')

    const result = await handleLesson(
      mockUser,
      'let nome = "Pedro"\nlet idade = 25',
      makeState('GATE_2', { currentConceptId: 'variaveis', gateAttempts: 0 }),
    )

    expect(result.decisions.gate_passed).toBe(true)
    expect(result.decisions.xp_earned).toBe(50)
  })

  it('Gate 2 passando avança para próximo conceito', async () => {
    mockClaudeResponse('{"passed": true, "feedback": "Perfeito! 🎯"}')

    const result = await handleLesson(
      mockUser,
      'let nome = "Pedro"',
      makeState('GATE_2', { currentConceptId: 'variaveis', gateAttempts: 0 }),
    )

    // Após Gate 2 de 'variaveis', próximo conceito é 'tipos-de-dados'
    expect(result.decisions.next_state).toBe('LESSON')
  })

  it('Gate 2 do último conceito retorna HUB', async () => {
    mockClaudeResponse('{"passed": true, "feedback": "Módulo completo! 🏆"}')

    const result = await handleLesson(
      mockUser,
      'if (hora > 18) { console.log("noite") }',
      makeState('GATE_2', { currentConceptId: 'condicionais', gateAttempts: 0 }),
    )

    expect(result.decisions.next_state).toBe('HUB')
  })
})
