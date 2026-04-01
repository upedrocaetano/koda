import { createSupabaseServerClient } from '@/lib/supabase/server'
import { calculateLevel } from '@koda/gamification'
import { MatrixCard, MatrixBadge, MatrixProgressBar } from '@/components/ui'
import { getProphecyOfTheDay } from '@/lib/prophecies'

// XP thresholds per level (mirrors packages/gamification/src/xp-calculator.ts)
const LEVEL_THRESHOLDS = [0, 0, 200, 500, 1000, 2000, 4000, 7000, 10000]

function getLevelProgress(totalXP: number, level: number) {
  const currentThreshold = LEVEL_THRESHOLDS[level] ?? 0
  const nextThreshold = LEVEL_THRESHOLDS[level + 1] ?? currentThreshold
  if (nextThreshold <= currentThreshold) return { percent: 100, xpCurrent: totalXP, xpNext: currentThreshold }
  const progress = ((totalXP - currentThreshold) / (nextThreshold - currentThreshold)) * 100
  return { percent: Math.min(100, progress), xpCurrent: totalXP, xpNext: nextThreshold }
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('name, total_xp, current_streak, level')
    .eq('id', user?.id ?? '')
    .single()

  const totalXP = profile?.total_xp ?? 0
  const levelInfo = calculateLevel(totalXP)
  const { percent, xpNext } = getLevelProgress(totalXP, levelInfo.level)
  const streak = profile?.current_streak ?? 0
  const userName = profile?.name || user?.user_metadata?.name || 'Operador'

  const { data: modules } = await supabase
    .from('modules')
    .select('id, name, order_index')
    .order('order_index')

  const { data: progress } = await supabase
    .from('progress')
    .select('module_id, mastery_level')
    .eq('user_id', user?.id ?? '')

  const progressByModule = new Map(
    (progress ?? []).map((p: { module_id: string; mastery_level: number }) => [
      p.module_id,
      p.mastery_level,
    ]),
  )

  const prophecy = getProphecyOfTheDay()

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold text-matrix-green">
          Olá, {userName}
        </h1>
        <p className="text-matrix-green-dim text-sm mt-1">
          Sua jornada na Matrix continua.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MatrixCard>
          <div className="flex items-center gap-4">
            <div
              className="text-4xl font-display font-bold text-matrix-green"
              style={{ textShadow: '0 0 12px #00FF41' }}
            >
              {levelInfo.level}
            </div>
            <div className="flex-1">
              <p className="text-sm text-matrix-green-dim">
                Nível {levelInfo.level} — {levelInfo.title}
              </p>
              <MatrixProgressBar
                value={percent}
                label={`${totalXP}/${xpNext} XP`}
                showPercentage
                className="mt-2"
              />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <MatrixBadge variant="xp" label={`${totalXP} XP`} />
            <MatrixBadge variant="level" label={levelInfo.title} />
          </div>
        </MatrixCard>

        <MatrixCard>
          <div className="flex items-center gap-4">
            <div className={`text-4xl ${streak > 0 ? '' : 'opacity-30'}`}>
              🔥
            </div>
            <div>
              <p className="text-3xl font-display font-bold text-matrix-green">
                {streak}
              </p>
              <p className="text-sm text-matrix-green-dim">
                {streak === 1
                  ? 'dia consecutivo'
                  : streak > 0
                    ? 'dias consecutivos'
                    : 'Comece um novo streak hoje!'}
              </p>
            </div>
          </div>
          {streak > 0 && (
            <MatrixBadge
              variant="streak"
              label={`Streak: ${streak} dias`}
              className="mt-3"
            />
          )}
        </MatrixCard>
      </div>

      <MatrixCard
        header={
          <span className="text-sm font-medium text-matrix-green">Módulos</span>
        }
      >
        {modules && modules.length > 0 ? (
          <div className="space-y-3">
            {modules.map((mod: { id: string; name: string; order_index: number }) => {
              const mastery = progressByModule.get(mod.id) ?? 0
              const pct = Math.round(mastery * 100)
              return (
                <div key={mod.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-matrix-green-dim">{mod.name}</span>
                    <MatrixBadge
                      variant={pct >= 100 ? 'xp' : 'streak'}
                      label={pct >= 100 ? 'Completo' : 'Em andamento'}
                    />
                  </div>
                  <MatrixProgressBar value={pct} />
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-matrix-muted text-sm">
            Nenhum módulo disponível ainda. Comece uma aula no chat!
          </p>
        )}
      </MatrixCard>

      <MatrixCard scanlines>
        <p className="text-matrix-green-dim text-sm italic mb-1">
          &ldquo;{prophecy}&rdquo;
        </p>
        <p className="text-matrix-muted text-xs">— Koda</p>
      </MatrixCard>
    </div>
  )
}
