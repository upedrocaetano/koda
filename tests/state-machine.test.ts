// Testes da FSM (Story 1.6)
// Testa transições puras — sem Supabase, sem side effects

import { describe, it, expect } from 'vitest'
import { transition, type StateContext, type ConversationStateEnum } from '../src/core/state-machine.js'

function makeContext(overrides: Partial<StateContext> = {}): StateContext {
  return {
    isNewUser: false,
    onboardingCompleted: true,
    currentModuleId: null,
    currentConceptId: null,
    gateAttempts: 0,
    contextStack: [],
    ...overrides,
  }
}

describe('state-machine transition()', () => {
  // 1. Novo usuário → ONBOARDING
  it('IDLE → ONBOARDING para novo usuário', () => {
    const ctx = makeContext({ isNewUser: true, onboardingCompleted: false })
    const result = transition('IDLE', 'greeting', ctx)
    expect(result.newState).toBe('ONBOARDING')
    expect(result.action).toBe('start_onboarding')
  })

  // 2. Usuário existente → HUB
  it('IDLE → HUB para usuário existente', () => {
    const ctx = makeContext()
    const result = transition('IDLE', 'greeting', ctx)
    expect(result.newState).toBe('HUB')
    expect(result.action).toBe('show_hub')
  })

  // 3. HUB → LESSON
  it('HUB → LESSON com lesson_continue', () => {
    const result = transition('HUB', 'lesson_continue', makeContext())
    expect(result.newState).toBe('LESSON')
    expect(result.action).toBe('start_lesson')
  })

  // 4. HUB → BREAK
  it('HUB → BREAK com mood_check', () => {
    const result = transition('HUB', 'mood_check', makeContext())
    expect(result.newState).toBe('BREAK')
    expect(result.action).toBe('take_break')
  })

  // 5. LESSON → GATE_1
  it('LESSON → GATE_1 com lesson_continue', () => {
    const result = transition('LESSON', 'lesson_continue', makeContext())
    expect(result.newState).toBe('GATE_1')
    expect(result.action).toBe('start_gate_1')
  })

  // 6. GATE_1 incrementa tentativas
  it('GATE_1 incrementa gateAttempts em gate_response', () => {
    const ctx = makeContext({ gateAttempts: 1 })
    const result = transition('GATE_1', 'gate_response', ctx)
    expect(result.newState).toBe('GATE_1')
    expect(result.contextUpdate.gateAttempts).toBe(2)
  })

  // 7. Dúvida empilha estado anterior
  it('HUB → DOUBT empilha HUB no contextStack', () => {
    const ctx = makeContext({ contextStack: [] })
    const result = transition('HUB', 'doubt', ctx)
    expect(result.newState).toBe('DOUBT')
    expect(result.contextUpdate.contextStack).toEqual(['HUB'])
  })

  // 8. DOUBT desempilha e volta
  it('DOUBT desempilha para estado anterior (LESSON)', () => {
    const ctx = makeContext({ contextStack: ['LESSON'] })
    const result = transition('DOUBT', 'lesson_continue', ctx)
    expect(result.newState).toBe('LESSON')
    expect(result.action).toBe('return_from_doubt')
    expect(result.contextUpdate.contextStack).toEqual([])
  })

  // 9. DOUBT sem stack volta para HUB
  it('DOUBT sem stack volta para HUB', () => {
    const ctx = makeContext({ contextStack: [] })
    const result = transition('DOUBT', 'greeting', ctx)
    expect(result.newState).toBe('HUB')
    expect(result.action).toBe('return_from_doubt')
  })

  // 10. BREAK → HUB com greeting
  it('BREAK → HUB com greeting', () => {
    const result = transition('BREAK', 'greeting', makeContext())
    expect(result.newState).toBe('HUB')
    expect(result.action).toBe('return_from_break')
  })

  // 11. Transição inválida mantém estado
  it('ONBOARDING continua em ONBOARDING com qualquer intent', () => {
    const result = transition('ONBOARDING', 'off_topic', makeContext())
    expect(result.newState).toBe('ONBOARDING')
    expect(result.action).toBe('continue_onboarding')
  })

  // 12. LESSON → DOUBT empilha LESSON
  it('LESSON → DOUBT empilha LESSON', () => {
    const ctx = makeContext({ contextStack: ['HUB'] })
    const result = transition('LESSON', 'doubt', ctx)
    expect(result.newState).toBe('DOUBT')
    expect(result.contextUpdate.contextStack).toEqual(['HUB', 'LESSON'])
  })
})
