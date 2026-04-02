'use client'

import { CodeRainCanvas } from '@/components/ui'

interface OnboardingLayoutProps {
  currentStep: number
  totalSteps: number
  children: React.ReactNode
}

const STEP_LABELS = ['Boas-vindas', 'Objetivo', 'Nível', 'Disponibilidade']

export function OnboardingLayout({ currentStep, totalSteps, children }: OnboardingLayoutProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4">
      <CodeRainCanvas opacity={0.1} speed={1.5} density={0.6} />

      <div className="relative z-10 w-full max-w-[480px] space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-matrix-green-dim">
            {STEP_LABELS.map((label, i) => (
              <span
                key={label}
                className={i <= currentStep ? 'text-matrix-green' : 'text-matrix-green-dim/40'}
              >
                {label}
              </span>
            ))}
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-matrix-green-deep/30">
            <div
              className="h-full rounded-full bg-matrix-green transition-all duration-500 ease-out shadow-[0_0_8px_rgba(0,255,65,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Content Card */}
        <div className="rounded-lg border border-matrix-green-dim/20 bg-matrix-card/90 backdrop-blur-sm p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
