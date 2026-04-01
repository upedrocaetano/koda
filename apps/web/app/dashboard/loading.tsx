import { MatrixSkeleton } from '@/components/ui/matrix-skeleton'

export default function DashboardLoading() {
  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header skeleton */}
      <div>
        <MatrixSkeleton className="h-7 w-48" />
        <MatrixSkeleton className="h-4 w-64 mt-2" />
      </div>

      {/* Level + Streak row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-matrix-green-dim/20 bg-matrix-card p-4">
          <div className="flex items-center gap-4">
            <MatrixSkeleton className="h-12 w-12 rounded-md" />
            <div className="flex-1 space-y-2">
              <MatrixSkeleton className="h-4 w-32" />
              <MatrixSkeleton className="h-2 w-full rounded-full" />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <MatrixSkeleton className="h-5 w-16 rounded-full" />
            <MatrixSkeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>

        <div className="rounded-lg border border-matrix-green-dim/20 bg-matrix-card p-4">
          <div className="flex items-center gap-4">
            <MatrixSkeleton className="h-12 w-12 rounded-md" />
            <div className="space-y-2">
              <MatrixSkeleton className="h-8 w-12" />
              <MatrixSkeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* Modules skeleton */}
      <div className="rounded-lg border border-matrix-green-dim/20 bg-matrix-card p-4 space-y-4">
        <MatrixSkeleton className="h-4 w-20" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between">
              <MatrixSkeleton className="h-4 w-40" />
              <MatrixSkeleton className="h-5 w-24 rounded-full" />
            </div>
            <MatrixSkeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>

      {/* Prophecy skeleton */}
      <div className="rounded-lg border border-matrix-green-dim/20 bg-matrix-card p-4">
        <MatrixSkeleton className="h-4 w-3/4" />
        <MatrixSkeleton className="h-3 w-16 mt-2" />
      </div>
    </div>
  )
}
