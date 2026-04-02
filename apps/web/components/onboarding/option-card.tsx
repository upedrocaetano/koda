'use client'

import { cn } from '@/lib/utils'

interface OptionCardProps {
  icon: string
  label: string
  description?: string
  selected: boolean
  onClick: () => void
}

export function OptionCard({ icon, label, description, selected, onClick }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-4 rounded-lg border px-4 py-4 text-left transition-all duration-300',
        selected
          ? 'border-matrix-green bg-matrix-green/10 shadow-[0_0_15px_rgba(0,255,65,0.2)]'
          : 'border-matrix-green-dim/20 bg-matrix-card hover:border-matrix-green-dim/40 hover:bg-matrix-card/80',
      )}
    >
      <span className="text-2xl" role="img" aria-hidden="true">
        {icon}
      </span>
      <div>
        <p
          className={cn(
            'text-sm font-medium transition-colors',
            selected ? 'text-matrix-green' : 'text-matrix-white',
          )}
        >
          {label}
        </p>
        {description && (
          <p className="text-xs text-matrix-green-dim/60 mt-0.5">{description}</p>
        )}
      </div>
      {selected && (
        <span className="ml-auto text-matrix-green text-lg">✓</span>
      )}
    </button>
  )
}
