// Queries de gamificação — XP awards e eventos
// Atualiza total_xp do usuário e insere evento na tabela gamification

import { supabase } from '../../services/supabase.js'
import { logger } from '../../utils/logger.js'
import { calculateLevel } from '../../modules/gamification/xp-calculator.js'

export async function awardXP(userId: string, xp: number, action: string): Promise<{ leveledUp: boolean; newLevel: number; newTitle: string }> {
  try {
    // Buscar XP atual
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

    // Atualizar XP total
    await supabase
      .from('users')
      .update({ total_xp: newTotalXP })
      .eq('id', userId)

    // Inserir evento de XP na tabela gamification
    await supabase.from('gamification').insert({
      user_id: userId,
      type: 'milestone',
      name: action,
      metadata: { xp_earned: xp, total_xp: newTotalXP, action },
    })

    // Se subiu de nível, inserir evento level_up
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
