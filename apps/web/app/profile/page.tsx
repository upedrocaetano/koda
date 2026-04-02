import { createSupabaseServerClient } from '@/lib/supabase/server'
import { calculateLevel } from '@koda/gamification'
import { ProfileClient } from './profile-client'

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userId = user?.id ?? ''

  const [profileRes, levelEventsRes, sessionsRes, progressRes] = await Promise.all([
    supabase
      .from('users')
      .select('name, email, goal, total_xp, current_streak, max_streak, created_at')
      .eq('id', userId)
      .single(),
    supabase
      .from('gamification')
      .select('created_at, details')
      .eq('user_id', userId)
      .eq('type', 'level_up')
      .order('created_at', { ascending: false }),
    supabase
      .from('sessions')
      .select('duration_minutes')
      .eq('user_id', userId),
    supabase
      .from('progress')
      .select('concepts_completed')
      .eq('user_id', userId),
  ])

  const profile = profileRes.data
  const totalXP = profile?.total_xp ?? 0
  const levelInfo = calculateLevel(totalXP)

  // Parse level events
  const levelEvents = (levelEventsRes.data ?? []).map((e: { created_at: string; details: Record<string, unknown> }) => ({
    created_at: e.created_at,
    new_level: (e.details?.new_level as number) ?? 0,
    xp_at_time: (e.details?.xp_at_time as number) ?? 0,
  }))

  // Stats
  const sessions = sessionsRes.data ?? []
  const progress = progressRes.data ?? []
  const totalMinutes = sessions.reduce(
    (sum: number, s: { duration_minutes?: number }) => sum + (s.duration_minutes ?? 0),
    0,
  )

  const stats = {
    totalSessions: sessions.length,
    hoursStudied: Math.round(totalMinutes / 60),
    conceptsMastered: progress.reduce(
      (sum: number, p: { concepts_completed?: number }) => sum + (p.concepts_completed ?? 0),
      0,
    ),
    bestStreak: profile?.max_streak ?? profile?.current_streak ?? 0,
  }

  return (
    <ProfileClient
      userId={userId}
      name={profile?.name ?? null}
      email={profile?.email ?? user?.email ?? null}
      goal={profile?.goal ?? null}
      level={`${levelInfo.level} — ${levelInfo.title}`}
      createdAt={profile?.created_at ?? new Date().toISOString()}
      levelEvents={levelEvents}
      stats={stats}
    />
  )
}
