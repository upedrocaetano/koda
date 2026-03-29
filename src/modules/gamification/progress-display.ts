// Progress Display — formata notificações de XP para WhatsApp
// Gera texto compacto e visual para feedback instantâneo ao aluno

export function formatXPNotification(
  xpEarned: number,
  totalXP: number,
  level: number,
  title: string,
  streak: number,
): string {
  const parts: string[] = []

  parts.push(`+${xpEarned} XP!`)
  parts.push(`Total: ${totalXP} XP`)
  parts.push(`Nível ${level}: ${title}`)

  if (streak > 0) {
    parts.push(`🔥 Streak: ${streak} ${streak === 1 ? 'dia' : 'dias'}`)
  }

  return parts.join(' | ')
}

export function formatLevelUp(level: number, title: string): string {
  return `🎉 LEVEL UP! Você agora é ${title} (Nível ${level})! 🚀`
}
