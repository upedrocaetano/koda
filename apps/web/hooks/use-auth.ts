'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import type { User } from '@supabase/supabase-js'

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
    const supabase = createSupabaseBrowserClient()
    const { data } = await supabase
      .from('users')
      .select('id, name, email, total_xp, current_streak, level, onboarding_completed')
      .eq('id', userId)
      .single()

    if (data) {
      setProfile(data as UserProfile)
    }
  }, [])

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()

    async function getInitialSession() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      setUser(currentUser)

      if (currentUser) {
        await fetchProfile(currentUser.id)
      }

      setIsLoading(false)
    }

    getInitialSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
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
