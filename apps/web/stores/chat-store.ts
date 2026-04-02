import { create } from 'zustand'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
  state?: string
  decisions?: {
    gate_passed: boolean | null
    xp_earned: number
    next_state: string
    concept_id: string | null
    gate_number: 1 | 2 | null
    attempts_used: number
    passed_with_help: boolean
  }
}

export interface LessonContext {
  module_name: string
  concept_name: string
  concept_id: string
}

interface ChatState {
  messages: ChatMessage[]
  isLoading: boolean
  hasMore: boolean
  currentState: string
  lessonContext: LessonContext | null
  lastXPEarned: number
  sendMessage: (content: string, userId: string) => Promise<void>
  loadHistory: (userId: string) => Promise<void>
  loadMore: (userId: string) => Promise<void>
  clearXPNotification: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  hasMore: true,
  currentState: 'HUB',
  lessonContext: null,
  lastXPEarned: 0,

  loadHistory: async (userId: string) => {
    const supabase = createSupabaseBrowserClient()
    const { data } = await supabase
      .from('interactions')
      .select('id, role, content, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (data) {
      const messages: ChatMessage[] = data
        .reverse()
        .map((row) => ({
          id: row.id,
          role: row.role as 'user' | 'assistant',
          content: row.content,
          createdAt: row.created_at,
        }))
      set({ messages, hasMore: data.length === 50 })
    }

    // Carregar estado atual da conversa
    const { data: stateRow } = await supabase
      .from('conversation_state')
      .select('current_state')
      .eq('user_id', userId)
      .single()

    if (stateRow) {
      set({ currentState: stateRow.current_state })
    }
  },

  loadMore: async (userId: string) => {
    const { messages } = get()
    if (messages.length === 0) return

    const oldest = messages[0]
    const supabase = createSupabaseBrowserClient()
    const { data } = await supabase
      .from('interactions')
      .select('id, role, content, created_at')
      .eq('user_id', userId)
      .lt('created_at', oldest.createdAt)
      .order('created_at', { ascending: false })
      .limit(50)

    if (data && data.length > 0) {
      const older: ChatMessage[] = data
        .reverse()
        .map((row) => ({
          id: row.id,
          role: row.role as 'user' | 'assistant',
          content: row.content,
          createdAt: row.created_at,
        }))
      set({ messages: [...older, ...messages], hasMore: data.length === 50 })
    } else {
      set({ hasMore: false })
    }
  },

  sendMessage: async (content: string, userId: string) => {
    const userMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    }

    set((state) => ({
      messages: [...state.messages, userMsg],
      isLoading: true,
    }))

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, userId }),
      })

      const data = await res.json()

      const assistantMsg: ChatMessage = {
        id: data.id || `resp-${Date.now()}`,
        role: 'assistant',
        content: data.response || 'Desculpe, não consegui processar sua mensagem.',
        createdAt: new Date().toISOString(),
        state: data.state,
        decisions: data.decisions,
      }

      set((state) => ({
        messages: [...state.messages, assistantMsg],
        isLoading: false,
        currentState: data.state || state.currentState,
        lessonContext: data.lesson_context || null,
        lastXPEarned: data.decisions?.xp_earned || 0,
      }))
    } catch {
      set((state) => ({
        messages: [
          ...state.messages,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: 'Erro ao conectar com o Koda. Tente novamente.',
            createdAt: new Date().toISOString(),
          },
        ],
        isLoading: false,
      }))
    }
  },

  clearXPNotification: () => set({ lastXPEarned: 0 }),
}))
