// Queries de gamificação — XP awards e eventos

import { supabase } from '../client.js'
import { logger } from '@koda/shared'
import { calculateLevel } from '@koda/gamification'

export async function awardXP(userId: string, xp: number, action: string): Promise<{ leveledUp: boolean; newLevel: number; newTitle: string }> {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('total_xp')
      .eq('id', userId)
      .single()

    const previousXP = user?.total_xp || 0
    const newTotalXP = previousXP + xp

    const previousLevel = calculateLevel(previousXP)
    const newLevel = calculateLevel(newTotalXP)
    const leveledUp = newLevel.level > previousLevel.level

    await supabase
      .from('users')
      .update({ total_xp: newTotalXP })
      .eq('id', userId)

    await supabase.from('gamification').insert({
      user_id: userId,
      type: 'milestone',
      name: action,
      metadata: { xp_earned: xp, total_xp: newTotalXP, action },
    })

    if (leveledUp) {
      await supabase.from('gamification').insert({
        user_id: userId,
        type: 'level_up',
        name: `Nível ${newLevel.level}: ${newLevel.title}`,
        metadata: { previous_level: previousLevel.level, new_level: newLevel.level, title: newLevel.title, total_xp: newTotalXP },
      })
    }

    return { leveledUp, newLevel: newLevel.level, newTitle: newLevel.title }
  } catch (error) {
    logger.warn('Falha ao conceder XP', {
      userId,
      xp,
      action,
      error: error instanceof Error ? error.message : String(error),
    })

    return { leveledUp: false, newLevel: 1, newTitle: 'Curioso' }
  }
}
