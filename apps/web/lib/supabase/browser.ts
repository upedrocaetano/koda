import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://qzqownkgfaomcvbbhvwi.supabase.co'

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6cW93bmtnZmFvbWN2YmJodndpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMjI3MDAsImV4cCI6MjA5MDY5ODcwMH0.hXFG3AC0E0ykhg7uD_-KhO94l5j80ra6aDhfJgAbfm0'

let browserClient: ReturnType<typeof createBrowserClient> | null = null

export function createSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  return browserClient
}
