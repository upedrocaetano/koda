import { createSupabaseServerClient } from '@/lib/supabase/server'
import { calculateLevel } from '@koda/gamification'
import { MatrixCard } from '@/components/ui'
import { ModuleMap } from '@/components/progress/module-map'
import { AchievementGrid, BADGE_DEFINITIONS } from '@/components/progress/achievement-grid'
import { ActivityHeatmap } from '@/components/progress/activity-heatmap'
import { StreakDisplay, StatsCards } from '@/components/progress/streak-display'
import { LevelUpCheck } from './level-up-check'

export default async function ProgressPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userId = user?.id ?? ''

  // Fetch data in parallel
  const [profileRes, modulesRes, progressRes, sessionsRes] = await Promise.all([
    supabase
      .from('users')
      .select('name, total_xp, current_streak, max_streak, level')
      .eq('id', userId)
      .single(),
    supabase.from('modules').select('id, name, order_index').order('order_index'),
    supabase.from('progress').select('module_id, mastery_level, concepts_completed').eq('user_id', userId),
    supabase
      .from('sessions')
      .select('started_at, duration_minutes')
      .eq('user_id', userId)
      .gte('started_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()),
  ])

  const profile = profileRes.data
  const modules = modulesRes.data ?? []
  const progress = progressRes.data ?? []
  const sessions = sessionsRes.data ?? []

  const totalXP = profile?.total_xp ?? 0
  const levelInfo = calculateLevel(totalXP)
  const currentStreak = profile?.current_streak ?? 0
  const maxStreak = profile?.max_streak ?? currentStreak

  // Build module map data
  const progressByModule = new Map(
    progress.map((p: { module_id: string; mastery_level: number }) => [p.module_id, p.mastery_level]),
  )

  const moduleNodes = modules.map((m: { id: string; name: string; order_index: number }) => ({
    id: m.id,
    name: m.name,
    order_index: m.order_index,
    mastery: progressByModule.get(m.id) ?? 0,
  }))

  // Build heatmap data (group sessions by day)
  const sessionsByDay = new Map<string, number>()
  for (const s of sessions) {
    const day = new Date(s.started_at).toISOString().split('T')[0]
    sessionsByDay.set(day, (sessionsByDay.get(day) ?? 0) + 1)
  }
  const heatmapData = Array.from(sessionsByDay.entries()).map(([date, count]) => ({
    date,
    count,
  }))

  // Calculate stats
  const conceptsMastered = progress.reduce(
    (sum: number, p: { concepts_completed?: number }) => sum + (p.concepts_completed ?? 0),
    0,
  )
  const totalMinutes = sessions.reduce(
    (sum: number, s: { duration_minutes?: number }) => sum + (s.duration_minutes ?? 0),
    0,
  )
  const hoursStudied = Math.round(totalMinutes / 60)
  const modulesComplete = progress.filter(
    (p: { mastery_level: number }) => p.mastery_level >= 1,
  ).length

  // Build achievements
  const achievements = BADGE_DEFINITIONS.map((badge) => {
    let unlocked = false
    switch (badge.id) {
      case 'first_login':
        unlocked = true // They're here
        break
      case 'first_lesson':
        unlocked = sessions.length > 0
        break
      case 'gate_1_master':
        unlocked = conceptsMastered >= 5
        break
      case 'gate_2_master':
        unlocked = conceptsMastered >= 5
        break
      case 'streak_7':
        unlocked = maxStreak >= 7
        break
      case 'streak_30':
        unlocked = maxStreak >= 30
        break
      case 'level_3':
        unlocked = levelInfo.level >= 3
        break
      case 'level_5':
        unlocked = levelInfo.level >= 5
        break
      case 'xp_100_day':
        unlocked = totalXP >= 100 // simplified check
        break
      case 'perfect_concept':
        unlocked = false // requires gate data we don't track here yet
        break
    }
    return { ...badge, unlocked }
  })

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Level-up check (client component) */}
      <LevelUpCheck level={levelInfo.level} title={levelInfo.title} />

      {/* Streak Display */}
      <StreakDisplay currentStreak={currentStreak} maxStreak={maxStreak} />

      {/* Stats Cards */}
      <StatsCards
        totalXP={totalXP}
        conceptsMastered={conceptsMastered}
        hoursStudied={hoursStudied}
        modulesComplete={modulesComplete}
      />

      {/* Module Map */}
      <MatrixCard
        header={
          <span className="text-sm font-medium text-matrix-green">
            Mapa de Módulos
          </span>
        }
      >
        <ModuleMap modules={moduleNodes} />
      </MatrixCard>

      {/* Achievements */}
      <MatrixCard
        header={
          <span className="text-sm font-medium text-matrix-green">
            Conquistas
          </span>
        }
      >
        <AchievementGrid achievements={achievements} />
      </MatrixCard>

      {/* Activity Heatmap */}
      <MatrixCard
        header={
          <span className="text-sm font-medium text-matrix-green">
            Histórico de Atividade (90 dias)
          </span>
        }
      >
        <ActivityHeatmap data={heatmapData} />
      </MatrixCard>
    </div>
  )
}
