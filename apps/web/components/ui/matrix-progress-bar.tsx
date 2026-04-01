import { cn } from '@/lib/utils'

interface MatrixProgressBarProps {
  value: number
  label?: string
  showPercentage?: boolean
  className?: string
}

export function MatrixProgressBar({
  value,
  label,
  showPercentage = false,
  className,
}: MatrixProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value))

  return (
    <div className={cn('space-y-1.5', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="text-matrix-green-dim">{label}</span>}
          {showPercentage && (
            <span className="text-matrix-green">{Math.round(clamped)}%</span>
          )}
        </div>
      )}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-matrix-green-deep/30"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
      >
        <div
          className="h-full rounded-full bg-matrix-green transition-all duration-500 ease-out shadow-[0_0_8px_rgba(0,255,65,0.5)]"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
