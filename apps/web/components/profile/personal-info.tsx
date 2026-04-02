'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { MatrixInput, MatrixButton } from '@/components/ui'
import { UserAvatar } from './user-avatar'

const GOALS = [
  { value: 'zero_to_dev', label: 'Aprender do zero' },
  { value: 'career_change', label: 'Mudar de carreira' },
  { value: 'create_saas', label: 'Criar meu SaaS' },
]

interface PersonalInfoProps {
  userId: string
  name: string | null
  email: string | null
  goal: string | null
  level: string
  createdAt: string
}

export function PersonalInfo({ userId, name, email, goal, level, createdAt }: PersonalInfoProps) {
  const [editName, setEditName] = useState(name || '')
  const [editGoal, setEditGoal] = useState(goal || '')
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    const supabase = createSupabaseBrowserClient()
    await supabase
      .from('users')
      .update({ name: editName.trim(), goal: editGoal })
      .eq('id', userId)

    setIsSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const hasChanges = editName.trim() !== (name || '') || editGoal !== (goal || '')

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <UserAvatar name={editName || name} size="lg" />
        <div>
          <p className="font-display text-lg text-matrix-green">{editName || name || 'Operador'}</p>
          <p className="text-xs text-matrix-green-dim">{email}</p>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <MatrixInput
          label="Nome"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          placeholder="Seu nome"
        />

        <div className="space-y-1.5">
          <label className="block text-sm text-matrix-green-dim">Email</label>
          <p className="text-sm text-matrix-green-dim/60 bg-matrix-input rounded-md border border-matrix-green-dim/30 px-3 py-2">
            {email}
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm text-matrix-green-dim">Objetivo</label>
          <select
            value={editGoal}
            onChange={(e) => setEditGoal(e.target.value)}
            className="w-full rounded-md border border-matrix-green-dim/30 bg-matrix-input px-3 py-2 text-sm text-matrix-green focus:outline-none focus:ring-2 focus:ring-matrix-green"
          >
            <option value="">Selecione...</option>
            {GOALS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4 text-xs text-matrix-green-dim/60">
          <span>Nível: <strong className="text-matrix-green">{level}</strong></span>
          <span>Desde: {new Date(createdAt).toLocaleDateString('pt-BR')}</span>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <MatrixButton
            variant="primary"
            size="sm"
            onClick={handleSave}
            loading={isSaving}
            disabled={!hasChanges}
          >
            Salvar Alterações
          </MatrixButton>
          {saved && (
            <span className="text-xs text-matrix-green animate-pulse">
              ✓ Salvo com sucesso
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
