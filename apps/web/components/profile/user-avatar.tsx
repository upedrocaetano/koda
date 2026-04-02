interface UserAvatarProps {
  name: string | null
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-12 w-12 text-lg',
  lg: 'h-20 w-20 text-2xl',
} as const

export function UserAvatar({ name, size = 'md' }: UserAvatarProps) {
  const initials = (name || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-matrix-green/20 border-2 border-matrix-green text-matrix-green font-display font-bold ${SIZES[size]}`}
      style={{ textShadow: '0 0 6px #00FF41' }}
      aria-label={`Avatar de ${name || 'usuário'}`}
    >
      {initials}
    </div>
  )
}
