import { cn } from '@/lib/utils'

interface ModuleNode {
  id: string
  name: string
  order_index: number
  mastery: number // 0-1
}

interface ModuleMapProps {
  modules: ModuleNode[]
}

const PHASES = [
  { name: 'Fundamentos', range: [1, 6] },
  { name: 'Lógica', range: [7, 12] },
  { name: 'Funções', range: [13, 18] },
  { name: 'Estruturas', range: [19, 24] },
  { name: 'Projetos', range: [25, 30] },
]

function getNodeStatus(mastery: number): 'complete' | 'active' | 'locked' {
  if (mastery >= 1) return 'complete'
  if (mastery > 0) return 'active'
  return 'locked'
}

export function ModuleMap({ modules }: ModuleMapProps) {
  // Pad to 30 modules for display
  const allModules: ModuleNode[] = Array.from({ length: 30 }, (_, i) => {
    const existing = modules.find((m) => m.order_index === i + 1)
    return existing || { id: `placeholder-${i}`, name: `Módulo ${i + 1}`, order_index: i + 1, mastery: 0 }
  })

  return (
    <div className="space-y-6">
      {PHASES.map((phase) => {
        const phaseModules = allModules.filter(
          (m) => m.order_index >= phase.range[0] && m.order_index <= phase.range[1],
        )

        return (
          <div key={phase.name}>
            <p className="text-xs text-matrix-green-dim mb-3 font-medium uppercase tracking-wider">
              {phase.name}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              {phaseModules.map((mod, idx) => {
                const status = getNodeStatus(mod.mastery)
                return (
                  <div key={mod.id} className="flex items-center gap-2">
                    <div className="group relative">
                      <div
                        className={cn(
                          'h-10 w-10 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all',
                          status === 'complete' &&
                            'border-matrix-green bg-matrix-green/20 text-matrix-green shadow-[0_0_10px_rgba(0,255,65,0.3)]',
                          status === 'active' &&
                            'border-matrix-green bg-matrix-green/10 text-matrix-green animate-pulse',
                          status === 'locked' &&
                            'border-matrix-green-dim/20 bg-matrix-card text-matrix-green-dim/30',
                        )}
                      >
                        {status === 'complete' ? '✓' : mod.order_index}
                      </div>
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                        <div className="bg-matrix-surface border border-matrix-green-dim/20 rounded px-2 py-1 text-xs text-matrix-green-dim whitespace-nowrap">
                          {mod.name}
                          <span className="text-matrix-green ml-1">
                            {Math.round(mod.mastery * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Connector line */}
                    {idx < phaseModules.length - 1 && (
                      <div
                        className={cn(
                          'h-0.5 w-4',
                          status === 'complete' || getNodeStatus(phaseModules[idx + 1]?.mastery ?? 0) !== 'locked'
                            ? 'bg-matrix-green/40'
                            : 'bg-matrix-green-dim/10',
                        )}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
