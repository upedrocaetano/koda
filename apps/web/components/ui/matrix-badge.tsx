import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        xp: 'bg-matrix-green/15 text-matrix-green border border-matrix-green/30',
        level:
          'bg-matrix-gold/15 text-matrix-gold border border-matrix-gold/30',
        streak:
          'bg-matrix-cyan/15 text-matrix-cyan border border-matrix-cyan/30',
        error:
          'bg-matrix-accent/15 text-matrix-accent border border-matrix-accent/30',
      },
    },
    defaultVariants: {
      variant: 'xp',
    },
  },
)

interface MatrixBadgeProps extends VariantProps<typeof badgeVariants> {
  label: string
  icon?: React.ReactNode
  className?: string
}

export function MatrixBadge({
  label,
  icon,
  variant,
  className,
}: MatrixBadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)}>
      {icon && <span aria-hidden="true">{icon}</span>}
      {label}
    </span>
  )
}
