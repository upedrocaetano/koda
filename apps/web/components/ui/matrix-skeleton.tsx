import { cn } from '@/lib/utils'

interface MatrixSkeletonProps {
  className?: string
}

export function MatrixSkeleton({ className }: MatrixSkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-matrix-green-deep/20',
        className,
      )}
      aria-hidden="true"
    />
  )
}
