// Calculador de XP e Níveis — funções puras sem dependências de banco
// Cada ação tem um XP fixo. O nível é calculado a partir do XP total acumulado.

export type XPAction =
  | 'gate_1_passed'
  | 'gate_2_passed'
  | 'gate_2_passed_with_help'
  | 'gate_3_passed'
  | 'quiz_correct'
  | 'session_started'
  | 'question_answered'
  | 'said_tired'
  | 'streak_7_days'
  | 'streak_30_days'

const XP_TABLE: Record<XPAction, number> = {
  gate_1_passed: 30,
  gate_2_passed: 50,
  gate_2_passed_with_help: 25,
  gate_3_passed: 100,
  quiz_correct: 20,
  session_started: 5,
  question_answered: 10,
  said_tired: 15,
  streak_7_days: 100,
  streak_30_days: 500,
}

export function calculateXP(action: XPAction): number {
  return XP_TABLE[action]
}

export interface LevelInfo {
  level: number
  title: string
}

const LEVELS: { minXP: number; level: number; title: string }[] = [
  { minXP: 10000, level: 8, title: 'Mestre Koda' },
  { minXP: 7000, level: 7, title: 'Arquiteto' },
  { minXP: 4000, level: 6, title: 'Fullstack' },
  { minXP: 2000, level: 5, title: 'Developer' },
  { minXP: 1000, level: 4, title: 'Codador' },
  { minXP: 500, level: 3, title: 'Praticante' },
  { minXP: 200, level: 2, title: 'Aprendiz' },
  { minXP: 0, level: 1, title: 'Curioso' },
]

export function calculateLevel(totalXP: number): LevelInfo {
  for (const entry of LEVELS) {
    if (totalXP >= entry.minXP) {
      return { level: entry.level, title: entry.title }
    }
  }
  return { level: 1, title: 'Curioso' }
}
