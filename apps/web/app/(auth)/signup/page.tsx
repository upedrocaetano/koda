'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { MatrixButton, MatrixCard, MatrixInput } from '@/components/ui'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)

    const supabase = createSupabaseBrowserClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  async function handleGoogleSignup() {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <MatrixCard className="w-full max-w-sm">
        <h1
          className="font-display text-2xl font-bold text-matrix-green text-center mb-6"
          style={{ textShadow: '0 0 10px #00FF41' }}
        >
          KODA
        </h1>

        <form onSubmit={handleSignup} className="space-y-4">
          <MatrixInput
            label="Nome"
            type="text"
            name="name"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <MatrixInput
            label="Email"
            type="email"
            name="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <MatrixInput
            label="Senha"
            type="password"
            name="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <MatrixInput
            label="Confirmar senha"
            type="password"
            name="confirmPassword"
            placeholder="Repita a senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-sm text-matrix-accent" role="alert">
              {error}
            </p>
          )}

          <MatrixButton
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full"
          >
            Criar conta
          </MatrixButton>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-matrix-green-dim/20" />
          <span className="text-xs text-matrix-muted">ou</span>
          <div className="h-px flex-1 bg-matrix-green-dim/20" />
        </div>

        <MatrixButton
          type="button"
          variant="secondary"
          className="w-full"
          onClick={handleGoogleSignup}
        >
          Cadastrar com Google
        </MatrixButton>

        <p className="mt-6 text-center text-xs text-matrix-green-dim">
          Já tem conta?{' '}
          <Link href="/login" className="text-matrix-cyan hover:underline">
            Entrar
          </Link>
        </p>
      </MatrixCard>
    </main>
  )
}
