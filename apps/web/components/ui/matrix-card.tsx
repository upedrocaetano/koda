import { cn } from '@/lib/utils'

interface MatrixCardProps {
  header?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
  scanlines?: boolean
  className?: string
}

export function MatrixCard({
  header,
  footer,
  children,
  scanlines = false,
  className,
}: MatrixCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border border-matrix-green-dim/20 bg-matrix-card',
        className,
      )}
    >
      {scanlines && (
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-[0.03]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 65, 0.1) 2px, rgba(0, 255, 65, 0.1) 4px)',
          }}
          aria-hidden="true"
        />
      )}
      {header && (
        <div className="border-b border-matrix-green-dim/20 px-4 py-3">
          {header}
        </div>
      )}
      <div className="relative z-0 px-4 py-4">{children}</div>
      {footer && (
        <div className="border-t border-matrix-green-dim/20 px-4 py-3">
          {footer}
        </div>
      )}
    </div>
  )
}
