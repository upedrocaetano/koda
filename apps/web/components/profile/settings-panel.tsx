'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface SettingToggleProps {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function SettingToggle({ label, description, checked, onChange }: SettingToggleProps) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer py-2">
      <div>
        <p className="text-sm text-matrix-green-dim">{label}</p>
        <p className="text-xs text-matrix-green-dim/40">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 rounded-full transition-colors shrink-0',
          checked ? 'bg-matrix-green/30 border border-matrix-green' : 'bg-matrix-card border border-matrix-green-dim/20',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-4 w-4 rounded-full transition-transform',
            checked ? 'translate-x-5 bg-matrix-green' : 'translate-x-0 bg-matrix-green-dim/40',
          )}
        />
      </button>
    </label>
  )
}

export function SettingsPanel() {
  const [codeRain, setCodeRain] = useState(true)
  const [sounds, setSounds] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    setCodeRain(localStorage.getItem('koda_codeRain') !== 'false')
    setSounds(localStorage.getItem('koda_sounds') === 'true')
    setReducedMotion(localStorage.getItem('koda_reducedMotion') === 'true')
  }, [])

  const toggle = (key: string, value: boolean, setter: (v: boolean) => void) => {
    localStorage.setItem(`koda_${key}`, String(value))
    setter(value)
  }

  return (
    <div className="divide-y divide-matrix-green-dim/10">
      <SettingToggle
        label="Code Rain no fundo"
        description="Animação de chuva de código no background"
        checked={codeRain}
        onChange={(v) => toggle('codeRain', v, setCodeRain)}
      />
      <SettingToggle
        label="Sons de notificação"
        description="Tocar sons ao ganhar XP ou completar conceitos"
        checked={sounds}
        onChange={(v) => toggle('sounds', v, setSounds)}
      />
      <SettingToggle
        label="Animações reduzidas"
        description="Reduzir animações para melhor acessibilidade"
        checked={reducedMotion}
        onChange={(v) => toggle('reducedMotion', v, setReducedMotion)}
      />
    </div>
  )
}
