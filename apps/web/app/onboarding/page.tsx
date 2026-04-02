'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { OnboardingLayout } from '@/components/onboarding/onboarding-layout'
import { StepWelcome } from '@/components/onboarding/step-welcome'
import { StepGoal } from '@/components/onboarding/step-goal'
import { StepLevel } from '@/components/onboarding/step-level'
import { StepAvailability } from '@/components/onboarding/step-availability'
import { MatrixButton } from '@/components/ui'

const TOTAL_STEPS = 4

interface OnboardingData {
  name: string
  goal: string
  level: string
  availability: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const { user, profile, isLoading: authLoading } = useAuth()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    name: '',
    goal: '',
    level: '',
    availability: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [showTransition, setShowTransition] = useState(false)

  // Redirect if already onboarded
  useEffect(() => {
    if (!authLoading && profile?.onboarding_completed) {
      router.replace('/dashboard')
    }
  }, [authLoading, profile?.onboarding_completed, router])

  // Pre-fill name from profile
  useEffect(() => {
    if (profile?.name && !data.name) {
      setData((prev) => ({ ...prev, name: profile.name || '' }))
    }
  }, [profile?.name, data.name])

  // Load partial progress
  useEffect(() => {
    if (!user?.id) return
    const supabase = createSupabaseBrowserClient()

    async function loadProgress() {
      const { data: stateRow } = await supabase
        .from('conversation_state')
        .select('context')
        .eq('user_id', user!.id)
        .single()

      if (stateRow?.context?.web_onboarding_step != null) {
        setStep(stateRow.context.web_onboarding_step)
      }
      if (stateRow?.context?.web_onboarding_data) {
        setData((prev) => ({ ...prev, ...stateRow.context.web_onboarding_data }))
      }
    }

    loadProgress()
  }, [user?.id])

  // Save partial progress on step change
  const saveProgress = useCallback(
    async (currentStep: number, currentData: OnboardingData) => {
      if (!user?.id) return
      const supabase = createSupabaseBrowserClient()

      await supabase
        .from('conversation_state')
        .upsert(
          {
            user_id: user.id,
            current_state: 'ONBOARDING',
            context: {
              web_onboarding_step: currentStep,
              web_onboarding_data: currentData,
            },
          },
          { onConflict: 'user_id' },
        )
    },
    [user?.id],
  )

  const canAdvance = () => {
    switch (step) {
      case 0:
        return data.name.trim().length >= 2
      case 1:
        return data.goal !== ''
      case 2:
        return data.level !== ''
      case 3:
        return data.availability !== ''
      default:
        return false
    }
  }

  const handleNext = async () => {
    if (step < TOTAL_STEPS - 1) {
      const nextStep = step + 1
      setStep(nextStep)
      await saveProgress(nextStep, data)
    } else {
      await handleComplete()
    }
  }

  const handleBack = async () => {
    if (step > 0) {
      const prevStep = step - 1
      setStep(prevStep)
      await saveProgress(prevStep, data)
    }
  }

  const handleComplete = async () => {
    if (!user?.id) return
    setIsSaving(true)

    const supabase = createSupabaseBrowserClient()

    // Save profile data
    await supabase
      .from('users')
      .update({
        name: data.name.trim(),
        goal: data.goal,
        programming_level: data.level,
        daily_minutes: parseInt(data.availability, 10),
        onboarding_completed: true,
      })
      .eq('id', user.id)

    // Update conversation state to HUB
    await supabase
      .from('conversation_state')
      .upsert(
        {
          user_id: user.id,
          current_state: 'HUB',
          context: {},
        },
        { onConflict: 'user_id' },
      )

    // Show transition animation
    setShowTransition(true)
    setTimeout(() => {
      router.replace('/dashboard')
    }, 2000)
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-matrix-green-dim text-sm animate-pulse">
          Conectando ao Koda...
        </p>
      </div>
    )
  }

  if (showTransition) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-matrix-bg">
        <div className="text-center space-y-3">
          <p
            className="font-display text-xl text-matrix-green animate-pulse"
            style={{ textShadow: '0 0 12px #00FF41' }}
          >
            Iniciando sua jornada...
          </p>
          <div className="h-1 w-48 mx-auto overflow-hidden rounded-full bg-matrix-green-deep/30">
            <div
              className="h-full rounded-full bg-matrix-green animate-[loading_2s_ease-in-out]"
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <OnboardingLayout currentStep={step} totalSteps={TOTAL_STEPS}>
      {/* Step Content */}
      <div className="min-h-[280px] flex flex-col justify-center">
        {step === 0 && (
          <StepWelcome name={data.name} onNameChange={(name) => setData((prev) => ({ ...prev, name }))} />
        )}
        {step === 1 && (
          <StepGoal goal={data.goal} onGoalChange={(goal) => setData((prev) => ({ ...prev, goal }))} />
        )}
        {step === 2 && (
          <StepLevel level={data.level} onLevelChange={(level) => setData((prev) => ({ ...prev, level }))} />
        )}
        {step === 3 && (
          <StepAvailability
            availability={data.availability}
            onAvailabilityChange={(availability) => setData((prev) => ({ ...prev, availability }))}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-matrix-green-dim/10">
        <MatrixButton
          variant="ghost"
          size="sm"
          onClick={handleBack}
          disabled={step === 0}
          className={step === 0 ? 'invisible' : ''}
        >
          ← Voltar
        </MatrixButton>

        <span className="text-xs text-matrix-green-dim/40">
          {step + 1} / {TOTAL_STEPS}
        </span>

        <MatrixButton
          variant="primary"
          size="sm"
          onClick={handleNext}
          disabled={!canAdvance()}
          loading={isSaving}
        >
          {step === TOTAL_STEPS - 1 ? 'Concluir ✓' : 'Próximo →'}
        </MatrixButton>
      </div>
    </OnboardingLayout>
  )
}
