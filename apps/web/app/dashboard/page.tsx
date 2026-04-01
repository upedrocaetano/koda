import { createSupabaseServerClient } from '@/lib/supabase/server'
import { MatrixCard } from '@/components/ui'

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <MatrixCard className="w-full max-w-md">
        <h1
          className="font-display text-xl font-bold text-matrix-green mb-4"
          style={{ textShadow: '0 0 8px #00FF41' }}
        >
          Dashboard
        </h1>
        <p className="text-matrix-green-dim text-sm">
          Bem-vindo, {user?.user_metadata?.name || user?.email || 'Operador'}
        </p>
        <p className="text-matrix-muted text-xs mt-2">
          Em construção — Story 2.4 implementará o dashboard completo.
        </p>
      </MatrixCard>
    </main>
  )
}
