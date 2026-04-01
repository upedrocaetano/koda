// Etapa 8 — Post-Process
// Extrai decisões do AI, calcula XP, atualiza progresso no Supabase
// Integra gamificação: awardXP, streak, notificação visual

import { logger } from '../../utils/logger.js'
import type { User } from '../../db/schema.js'
import type { AIResult } from './ai-engine.js'
import { awardXP } from '../../db/queries/gamification.js'
import { updateStreak } from '../../modules/gamification/streak-tracker.js'
import { calculateLevel } from '../../modules/gamification/xp-calculator.js'
import { formatXPNotification, formatLevelUp } from '../../modules/gamification/progress-display.js'

export interface PostProcessResult {
  responseText: string
  xpEarned: number
  gatePassed: boolean
}

export async function postProcess(user: User, aiResult: AIResult): Promise<PostProcessResult> {
  const xpEarned = aiResult.decisions.xp_earned
  let responseText = aiResult.responseText

  // Atualizar streak a cada mensagem
  const streakResult = await updateStreak(user.id)

  // Somar bônus de streak ao XP ganho
  const totalXPEarned = xpEarned + streakResult.bonusXP

  // Conceder XP se ganhou algo
  let leveledUp = false
  let newLevel = 1
  let newTitle = 'Curioso'

  if (totalXPEarned > 0) {
    const action = aiResult.decisions.gate_passed ? 'gate_passed' : 'lesson_interaction'
    const awardResult = await awardXP(user.id, totalXPEarned, action)
    leveledUp = awardResult.leveledUp
    newLevel = awardResult.newLevel
    newTitle = awardResult.newTitle
  }

  // Adicionar notificação de XP ao final da resposta
  if (totalXPEarned > 0) {
    const newTotalXP = user.total_xp + totalXPEarned
    const levelInfo = calculateLevel(newTotalXP)

    const xpNotification = formatXPNotification(
      totalXPEarned,
      newTotalXP,
      levelInfo.level,
      levelInfo.title,
      streakResult.currentStreak,
    )

    responseText += `\n\n${xpNotification}`

    if (leveledUp) {
      responseText += `\n${formatLevelUp(newLevel, newTitle)}`
    }
  }

  return {
    responseText,
    xpEarned: totalXPEarned,
    gatePassed: aiResult.decisions.gate_passed,
  }
}
