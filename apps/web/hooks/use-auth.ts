'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  name: string | null
  email: string | null
  total_xp: number
  current_streak: number
  level: string
  onboarding_completed: boolean
}

interface AuthState {
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  signOut: () => Promise<void>
}

export function useAuth(): AuthState {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const supabase = createSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, total_xp, current_streak, level, onboarding_completed')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Erro ao buscar perfil:', error)
      }

      if (data) {
        setProfile(data as UserProfile)
      }
    } catch (err) {
      console.error('Erro inesperado no fetchProfile:', err)
    }
  }, [])

  useEffect(() => {
    try {
      const supabase = createSupabaseBrowserClient()

      // Timeout de 5s para não travar o chat
      const timeout = setTimeout(() => {
        console.warn('useAuth: timeout de 5s atingido, liberando UI')
        setIsLoading(false)
      }, 5000)

      async function getInitialSession() {
        try {
          const { data: { user: currentUser }, error } = await supabase.auth.getUser()

          if (error) {
            console.error('Erro de autenticação:', error)
          }

          setUser(currentUser)

          if (currentUser) {
            await fetchProfile(currentUser.id)
          }
        } catch (error) {
          console.error('Exceção ao carregar a sessão auth:', error)
        } finally {
          clearTimeout(timeout)
          setIsLoading(false)
        }
      }

      getInitialSession()

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          await fetchProfile(currentUser.id)
        } else {
          setProfile(null)
        }

        setIsLoading(false)
      })

      return () => subscription.unsubscribe()
    } catch (err) {
      console.error('Erro crítico em useAuth useEffect (verifique variáveis de ambiente):', err)
      setIsLoading(false)
      return () => {} // fallback pra função de limpeza
    }
  }, [fetchProfile])

  const signOut = useCallback(async () => {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    router.push('/login')
    router.refresh()
  }, [router])

  return {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    signOut,
  }
}
