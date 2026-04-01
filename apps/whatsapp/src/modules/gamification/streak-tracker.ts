// Streak Tracker — rastreia dias consecutivos de estudo
// Compara last_active_at com a data atual em America/Sao_Paulo

import { supabase } from '../../services/supabase.js'
import { logger } from '../../utils/logger.js'
import { calculateXP, type XPAction } from './xp-calculator.js'

export interface StreakResult {
  currentStreak: number
  maxStreak: number
  streakMaintained: boolean
  isNewRecord: boolean
  bonusXP: number
}

function getTodaySP(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
}

function getDateSP(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
}

function daysDiff(dateA: string, dateB: string): number {
  const a = new Date(dateA)
  const b = new Date(dateB)
  return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24))
}

export async function updateStreak(userId: string): Promise<StreakResult> {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('current_streak, max_streak, last_active_at')
      .eq('id', userId)
      .single()

    if (!user) {
      return { currentStreak: 1, maxStreak: 1, streakMaintained: false, isNewRecord: false, bonusXP: 0 }
    }

    const today = getTodaySP()
    const lastActiveDate = user.last_active_at ? getDateSP(user.last_active_at) : null
    const currentStreak = user.current_streak || 0
    const maxStreak = user.max_streak || 0

    let newStreak: number
    let streakMaintained: boolean

    if (!lastActiveDate) {
      // Primeiro acesso
      newStreak = 1
      streakMaintained = false
    } else if (lastActiveDate === today) {
      // Já acessou hoje — mantém streak sem incrementar
      newStreak = currentStreak
      streakMaintained = true
    } else if (daysDiff(today, lastActiveDate) === 1) {
      // Acessou ontem — incrementa streak
      newStreak = currentStreak + 1
      streakMaintained = true
    } else {
      // Gap de mais de 1 dia — reseta streak
      newStreak = 1
      streakMaintained = false
    }

    const newMaxStreak = Math.max(maxStreak, newStreak)
    const isNewRecord = newStreak > maxStreak

    // Calcular bônus de streak
    let bonusXP = 0
    if (newStreak === 7 && currentStreak < 7) {
      bonusXP = calculateXP('streak_7_days')
    } else if (newStreak === 30 && currentStreak < 30) {
      bonusXP = calculateXP('streak_30_days')
    }

    // Persistir no banco
    await supabase
      .from('users')
      .update({
        current_streak: newStreak,
        max_streak: newMaxStreak,
        last_active_at: new Date().toISOString(),
      })
      .eq('id', userId)

    return {
      currentStreak: newStreak,
      maxStreak: newMaxStreak,
      streakMaintained,
      isNewRecord,
      bonusXP,
    }
  } catch (error) {
    logger.warn('Falha ao atualizar streak', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    })

    return { currentStreak: 0, maxStreak: 0, streakMaintained: false, isNewRecord: false, bonusXP: 0 }
  }
}
