// Testes do módulo de gamificação (Story 1.9)
// XP calculator, streak tracker, progress display, awardXP

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock do Supabase
vi.mock('../src/services/supabase.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
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

// Mock do logger
vi.mock('../src/utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

import { calculateXP, calculateLevel, type XPAction } from '../src/modules/gamification/xp-calculator.js'
import { formatXPNotification, formatLevelUp } from '../src/modules/gamification/progress-display.js'
import { updateStreak } from '../src/modules/gamification/streak-tracker.js'
import { awardXP } from '../src/db/queries/gamification.js'
import { supabase } from '../src/services/supabase.js'

const mockFrom = supabase.from as ReturnType<typeof vi.fn>

beforeEach(() => {
  vi.clearAllMocks()
})

// ── XP Calculator Tests ──

describe('calculateXP', () => {
  it.each<[XPAction, number]>([
    ['gate_1_passed', 30],
    ['gate_2_passed', 50],
    ['gate_2_passed_with_help', 25],
    ['gate_3_passed', 100],
    ['quiz_correct', 20],
    ['session_started', 5],
    ['question_answered', 10],
    ['said_tired', 15],
    ['streak_7_days', 100],
    ['streak_30_days', 500],
  ])('retorna %d XP para ação "%s"', (action, expectedXP) => {
    expect(calculateXP(action)).toBe(expectedXP)
  })
})

// ── Level Calculator Tests ──

describe('calculateLevel', () => {
  it('nível 1 (Curioso) para 0 XP', () => {
    const result = calculateLevel(0)
    expect(result).toEqual({ level: 1, title: 'Curioso' })
  })

  it('nível 1 (Curioso) para 199 XP', () => {
    const result = calculateLevel(199)
    expect(result).toEqual({ level: 1, title: 'Curioso' })
  })

  it('nível 2 (Aprendiz) para 200 XP', () => {
    const result = calculateLevel(200)
    expect(result).toEqual({ level: 2, title: 'Aprendiz' })
  })

  it('nível 3 (Praticante) para 500 XP', () => {
    expect(calculateLevel(500)).toEqual({ level: 3, title: 'Praticante' })
  })

  it('nível 4 (Codador) para 1000 XP', () => {
    expect(calculateLevel(1000)).toEqual({ level: 4, title: 'Codador' })
  })

  it('nível 5 (Developer) para 2000 XP', () => {
    expect(calculateLevel(2000)).toEqual({ level: 5, title: 'Developer' })
  })

  it('nível 6 (Fullstack) para 4000 XP', () => {
    expect(calculateLevel(4000)).toEqual({ level: 6, title: 'Fullstack' })
  })

  it('nível 7 (Arquiteto) para 7000 XP', () => {
    expect(calculateLevel(7000)).toEqual({ level: 7, title: 'Arquiteto' })
  })

  it('nível 8 (Mestre Koda) para 10000 XP', () => {
    expect(calculateLevel(10000)).toEqual({ level: 8, title: 'Mestre Koda' })
  })

  it('nível 8 (Mestre Koda) para XP muito alto', () => {
    expect(calculateLevel(99999)).toEqual({ level: 8, title: 'Mestre Koda' })
  })
})

// ── Progress Display Tests ──

describe('formatXPNotification', () => {
  it('formata notificação básica sem streak', () => {
    const result = formatXPNotification(30, 180, 1, 'Curioso', 0)
    expect(result).toContain('+30 XP!')
    expect(result).toContain('Total: 180 XP')
    expect(result).toContain('Nível 1: Curioso')
    expect(result).not.toContain('Streak')
  })

  it('inclui streak quando > 0', () => {
    const result = formatXPNotification(50, 230, 2, 'Aprendiz', 3)
    expect(result).toContain('+50 XP!')
    expect(result).toContain('Streak: 3 dias')
  })

  it('usa "dia" no singular para streak = 1', () => {
    const result = formatXPNotification(10, 10, 1, 'Curioso', 1)
    expect(result).toContain('Streak: 1 dia')
    expect(result).not.toContain('dias')
  })
})

describe('formatLevelUp', () => {
  it('formata mensagem de level-up', () => {
    const result = formatLevelUp(2, 'Aprendiz')
    expect(result).toContain('LEVEL UP')
    expect(result).toContain('Aprendiz')
    expect(result).toContain('Nível 2')
  })
})

// ── Streak Tracker Tests ──

describe('updateStreak', () => {
  function mockUserData(data: Record<string, unknown> | null) {
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data, error: null }),
        })),
      })),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
    })
  }

  it('retorna streak 1 para primeiro acesso (sem last_active_at)', async () => {
    mockUserData({ current_streak: 0, max_streak: 0, last_active_at: null })

    const result = await updateStreak('user-1')
    expect(result.currentStreak).toBe(1)
    expect(result.streakMaintained).toBe(false)
  })

  it('mantém streak se já acessou hoje', async () => {
    const today = new Date().toISOString()
    mockUserData({ current_streak: 5, max_streak: 5, last_active_at: today })

    const result = await updateStreak('user-1')
    expect(result.currentStreak).toBe(5)
    expect(result.streakMaintained).toBe(true)
  })

  it('incrementa streak se acessou ontem', async () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    mockUserData({ current_streak: 3, max_streak: 3, last_active_at: yesterday })

    const result = await updateStreak('user-1')
    expect(result.currentStreak).toBe(4)
    expect(result.streakMaintained).toBe(true)
  })

  it('reseta streak para 1 se gap > 1 dia', async () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    mockUserData({ current_streak: 10, max_streak: 10, last_active_at: threeDaysAgo })

    const result = await updateStreak('user-1')
    expect(result.currentStreak).toBe(1)
    expect(result.streakMaintained).toBe(false)
  })

  it('detecta novo recorde de streak', async () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    mockUserData({ current_streak: 5, max_streak: 5, last_active_at: yesterday })

    const result = await updateStreak('user-1')
    expect(result.isNewRecord).toBe(true)
    expect(result.maxStreak).toBe(6)
  })

  it('concede bônus de 100 XP ao atingir 7 dias', async () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    mockUserData({ current_streak: 6, max_streak: 6, last_active_at: yesterday })

    const result = await updateStreak('user-1')
    expect(result.currentStreak).toBe(7)
    expect(result.bonusXP).toBe(100)
  })

  it('concede bônus de 500 XP ao atingir 30 dias', async () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    mockUserData({ current_streak: 29, max_streak: 29, last_active_at: yesterday })

    const result = await updateStreak('user-1')
    expect(result.currentStreak).toBe(30)
    expect(result.bonusXP).toBe(500)
  })

  it('retorna fallback quando user não encontrado', async () => {
    mockUserData(null)

    const result = await updateStreak('user-inexistente')
    expect(result.currentStreak).toBe(1)
    expect(result.bonusXP).toBe(0)
  })

  it('retorna fallback em caso de erro', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockRejectedValue(new Error('DB error')),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
    })

    const result = await updateStreak('user-1')
    expect(result.currentStreak).toBe(0)
    expect(result.bonusXP).toBe(0)
  })
})

// ── Award XP Tests ──

describe('awardXP', () => {
  function mockUserXP(totalXP: number) {
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: { total_xp: totalXP }, error: null }),
        })),
      })),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
    })
  }

  it('retorna leveledUp false quando não muda de nível', async () => {
    mockUserXP(100) // Nível 1 → 100+30=130, ainda nível 1

    const result = await awardXP('user-1', 30, 'gate_1_passed')
    expect(result.leveledUp).toBe(false)
    expect(result.newLevel).toBe(1)
  })

  it('detecta level-up de nível 1 para 2', async () => {
    mockUserXP(180) // Nível 1 → 180+30=210, nível 2

    const result = await awardXP('user-1', 30, 'gate_1_passed')
    expect(result.leveledUp).toBe(true)
    expect(result.newLevel).toBe(2)
    expect(result.newTitle).toBe('Aprendiz')
  })

  it('retorna fallback em caso de erro', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockRejectedValue(new Error('DB error')),
        })),
      })),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
    })

    const result = await awardXP('user-1', 50, 'gate_2_passed')
    expect(result.leveledUp).toBe(false)
    expect(result.newLevel).toBe(1)
  })
})
