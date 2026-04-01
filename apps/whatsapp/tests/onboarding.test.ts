// Testes do fluxo de onboarding (Story 1.7)
// Mock do Claude para testar parsing, extração de dados e transições de step

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock do Claude ANTES de importar o handler
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
      update: vi.fn(() => ({
        eq: vi.fn(() => ({ error: null })),
      })),
      upsert: vi.fn(() => ({ error: null })),
    })),
  },
}))

// Mock de queries de DB
vi.mock('../src/db/queries/users.js', () => ({
  updateUserProfile: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../src/db/queries/conversation-state.js', () => ({
  setState: vi.fn().mockResolvedValue(undefined),
  getState: vi.fn().mockResolvedValue(null),
}))

import { handleOnboarding } from '../src/modules/onboarding/handler.js'
import { claude } from '../src/services/claude.js'
import { updateUserProfile } from '../src/db/queries/users.js'
import { setState } from '../src/db/queries/conversation-state.js'
import type { User } from '../src/db/schema.js'

const mockCreate = claude.messages.create as ReturnType<typeof vi.fn>
const mockUpdateProfile = updateUserProfile as ReturnType<typeof vi.fn>
const mockSetState = setState as ReturnType<typeof vi.fn>

function mockClaudeResponse(text: string) {
  mockCreate.mockResolvedValueOnce({
    content: [{ type: 'text', text }],
  })
}

const baseUser: User = {
  id: 'user-123',
  phone: '+5511999999999',
  name: null,
  objective: null,
  level: 'beginner',
  daily_availability: null,
  timezone: 'America/Sao_Paulo',
  total_xp: 0,
  current_streak: 0,
  max_streak: 0,
  dropout_risk_score: null,
  mood: null,
  onboarding_completed: false,
  preferred_study_time: null,
  notification_enabled: true,
  preferences: {},
  last_active_at: null,
  created_at: '2026-03-29T00:00:00Z',
  updated_at: '2026-03-29T00:00:00Z',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('handleOnboarding', () => {
  // AC1 & AC2: Função exporta e retorna OnboardingResult
  it('retorna OnboardingResult com responseText, nextStep e userData', async () => {
    mockClaudeResponse('{"response_text": "Olá! 👋 Sou o Koda!", "extracted_data": {}}')

    const result = await handleOnboarding(baseUser, 'oi', 0)

    expect(result).toHaveProperty('responseText')
    expect(result).toHaveProperty('nextStep')
    expect(result).toHaveProperty('userData')
  })

  // AC3: Step 0 — apresentação
  it('step 0: Koda se apresenta e pergunta o nome', async () => {
    mockClaudeResponse('{"response_text": "Oi! 👋 Sou o Koda, seu professor de programação! Qual é o seu nome?", "extracted_data": {}}')

    const result = await handleOnboarding(baseUser, 'oi', 0)

    expect(result.responseText).toContain('Koda')
    expect(result.nextStep).toBe(1)
    expect(result.userData).toEqual({})
  })

  // AC4: Step 1 — nome
  it('step 1: extrai nome e avança para step 2', async () => {
    mockClaudeResponse('{"response_text": "Legal, Pedro! O que te traz aqui?", "extracted_data": {"name": "Pedro"}}')

    const result = await handleOnboarding(baseUser, 'Pedro', 1)

    expect(result.nextStep).toBe(2)
    expect(result.userData.name).toBe('Pedro')
    expect(mockUpdateProfile).toHaveBeenCalledWith('user-123', { name: 'Pedro' })
  })

  // AC5: Step 2 — objetivo (mapeado para campo objective)
  it('step 2: extrai objetivo e avança para step 3', async () => {
    mockClaudeResponse('{"response_text": "Boa! Qual seu nível?", "extracted_data": {"goal": "create_saas"}}')

    const result = await handleOnboarding({ ...baseUser, name: 'Pedro' }, 'quero criar meu app', 2)

    expect(result.nextStep).toBe(3)
    expect(result.userData.objective).toBe('create_saas')
    expect(mockUpdateProfile).toHaveBeenCalledWith('user-123', { objective: 'create_saas' })
  })

  // AC6: Step 3 — nível
  it('step 3: extrai nível e avança para step 4', async () => {
    mockClaudeResponse('{"response_text": "Quanto tempo por dia?", "extracted_data": {"level": "beginner"}}')

    const result = await handleOnboarding({ ...baseUser, name: 'Pedro' }, 'nunca programei', 3)

    expect(result.nextStep).toBe(4)
    expect(result.userData.level).toBe('beginner')
    expect(mockUpdateProfile).toHaveBeenCalledWith('user-123', { level: 'beginner' })
  })

  // AC7: Step 4 — disponibilidade + conclusão
  it('step 4: extrai disponibilidade e marca onboarding completo', async () => {
    mockClaudeResponse('{"response_text": "Show! Tudo pronto! 🎉 Manda bora!", "extracted_data": {"availability_minutes": 20}}')

    const result = await handleOnboarding({ ...baseUser, name: 'Pedro' }, '15-30 min', 4)

    expect(result.nextStep).toBeNull() // onboarding completo
    expect(result.userData.daily_availability).toBe(20)
    expect(mockUpdateProfile).toHaveBeenCalledWith('user-123', { daily_availability: 20 })
  })

  // AC8: Após step 4, onboarding_completed = true
  it('step 4: atualiza onboarding_completed para true', async () => {
    mockClaudeResponse('{"response_text": "Pronto!", "extracted_data": {"availability_minutes": 10}}')

    await handleOnboarding(baseUser, '5-10 min', 4)

    expect(mockUpdateProfile).toHaveBeenCalledWith('user-123', { onboarding_completed: true })
  })

  // AC9: Após step 4, transiciona para HUB
  it('step 4: transiciona estado para HUB', async () => {
    mockClaudeResponse('{"response_text": "Pronto!", "extracted_data": {"availability_minutes": 45}}')

    await handleOnboarding(baseUser, '30+ min', 4)

    expect(mockSetState).toHaveBeenCalledWith('user-123', 'HUB', { onboardingCompleted: true })
  })

  // AC13: Resposta sem JSON — fallback para resposta padrão
  it('usa resposta padrão quando Claude não retorna JSON', async () => {
    mockClaudeResponse('Desculpa, não entendi')

    const result = await handleOnboarding(baseUser, 'xyz', 0)

    expect(result.responseText).toBeTruthy()
    expect(result.nextStep).toBe(0) // fica no mesmo step
    expect(result.userData).toEqual({})
  })

  // AC13: Erro da API — fallback gracioso
  it('retorna fallback quando Claude falha', async () => {
    mockCreate.mockRejectedValueOnce(new Error('API timeout'))

    const result = await handleOnboarding(baseUser, 'oi', 1)

    expect(result.responseText).toBeTruthy()
    expect(result.nextStep).toBe(1) // retry no mesmo step
    expect(result.userData).toEqual({})
  })

  // AC14: Context atualizado com onboarding_step
  it('atualiza context com onboarding_step a cada step', async () => {
    mockClaudeResponse('{"response_text": "Legal!", "extracted_data": {"name": "Pedro"}}')

    await handleOnboarding(baseUser, 'Pedro', 1)

    expect(mockSetState).toHaveBeenCalledWith('user-123', 'ONBOARDING', { onboarding_step: 2 })
  })
})
