// Etapa 10 — Log & Update
// Salva interação na tabela interactions, atualiza sessão, atualiza last_active_at

import { supabase } from '../../services/supabase.js'
import { logger } from '../../utils/logger.js'
import type { User } from '../../db/schema.js'
import type { PipelineInput } from '../pipeline.js'
import type { IntentResult } from './classify-intent.js'
import type { AIResult } from './ai-engine.js'
import type { PostProcessResult } from './post-process.js'

export async function logUpdate(
  user: User,
  input: PipelineInput,
  intent: IntentResult,
  aiResult: AIResult,
  processed: PostProcessResult,
  totalLatencyMs: number,
): Promise<void> {
  try {
    // Buscar ou criar sessão ativa (sem ended_at)
    let sessionId: string

    const { data: activeSession } = await supabase
      .from('sessions')
      .select('id')
      .eq('user_id', user.id)
      .is('ended_at', null)
      .order('started_at', { ascending: false })
      .limit(1)
      .single()

    if (activeSession) {
      sessionId = activeSession.id

      // Incrementar messages_count e xp_earned da sessão
      // Busca dados atuais para incrementar
      const { data: sessionData } = await supabase
        .from('sessions')
        .select('messages_count, xp_earned')
        .eq('id', sessionId)
        .single()

      await supabase
        .from('sessions')
        .update({
          messages_count: ((sessionData?.messages_count as number) || 0) + 1,
          xp_earned: ((sessionData?.xp_earned as number) || 0) + processed.xpEarned,
        })
        .eq('id', sessionId)
    } else {
      // Criar nova sessão
      const { data: newSession, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          user_id: user.id,
          messages_count: 1,
          xp_earned: processed.xpEarned,
        })
        .select('id')
        .single()

      if (sessionError || !newSession) {
        logger.warn('Falha ao criar sessão', { userId: user.id })
        return
      }
      sessionId = newSession.id
    }

    // Salvar interação
    await supabase.from('interactions').insert({
      session_id: sessionId,
      user_id: user.id,
      type: 'lesson',
      user_message: input.text ?? '[mídia]',
      bot_response: processed.responseText,
      intent: intent.intent,
      intent_confidence: intent.confidence,
      xp_earned: processed.xpEarned,
      ai_model: aiResult.model,
      tokens_in: aiResult.tokensIn,
      tokens_out: aiResult.tokensOut,
      latency_ms: aiResult.latencyMs,
      metadata: { decisions: aiResult.decisions, totalLatencyMs },
    })

    // Atualizar last_active_at
    await supabase
      .from('users')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', user.id)
  } catch (error) {
    // Log mas não falha — dados de telemetria não devem bloquear a resposta
    logger.warn('Falha ao salvar log', {
      userId: user.id,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
