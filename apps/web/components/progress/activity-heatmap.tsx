import { cn } from '@/lib/utils'

interface DayActivity {
  date: string // YYYY-MM-DD
  count: number
}

interface ActivityHeatmapProps {
  data: DayActivity[]
}

function getIntensity(count: number): 0 | 1 | 2 | 3 {
  if (count === 0) return 0
  if (count <= 2) return 1
  if (count <= 5) return 2
  return 3
}

const INTENSITY_CLASSES = {
  0: 'bg-matrix-green-dim/10',
  1: 'bg-matrix-green-deep',
  2: 'bg-matrix-green-dark',
  3: 'bg-matrix-green shadow-[0_0_4px_rgba(0,255,65,0.3)]',
} as const

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  // Build 90-day grid from today backwards
  const today = new Date()
  const days: { date: string; count: number }[] = []

  const countByDate = new Map(data.map((d) => [d.date, d.count]))

  for (let i = 89; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    days.push({ date: dateStr, count: countByDate.get(dateStr) ?? 0 })
  }

  // Group into weeks (columns of 7)
  const weeks: typeof days[] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  const totalSessions = data.reduce((sum, d) => sum + d.count, 0)
  const activeDays = data.filter((d) => d.count > 0).length

  return (
    <div className="space-y-3">
      <div className="flex gap-2 text-xs text-matrix-green-dim">
        <span>{activeDays} dias ativos</span>
        <span>·</span>
        <span>{totalSessions} sessões</span>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-2">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => {
              const intensity = getIntensity(day.count)
              return (
                <div
                  key={day.date}
                  className={cn(
                    'h-3 w-3 rounded-sm transition-colors',
                    INTENSITY_CLASSES[intensity],
                  )}
                  title={`${day.date}: ${day.count} sessão(ões)`}
                />
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 text-xs text-matrix-green-dim/60">
        <span>Menos</span>
        {([0, 1, 2, 3] as const).map((level) => (
          <div
            key={level}
            className={cn('h-3 w-3 rounded-sm', INTENSITY_CLASSES[level])}
          />
        ))}
        <span>Mais</span>
      </div>
    </div>
  )
}
