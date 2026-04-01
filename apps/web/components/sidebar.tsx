'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '◉' },
  { href: '/chat', label: 'Chat', icon: '◈' },
  { href: '/progress', label: 'Progresso', icon: '◆' },
  { href: '/profile', label: 'Perfil', icon: '◎' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <nav
        className="hidden md:flex flex-col w-56 min-h-screen border-r border-matrix-green-dim/20 bg-matrix-surface p-4"
        aria-label="Navegação principal"
      >
        <Link
          href="/dashboard"
          className="font-display text-lg font-bold text-matrix-green mb-8"
          style={{ textShadow: '0 0 8px #00FF41' }}
        >
          KODA
        </Link>

        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-matrix-green/10 text-matrix-green'
                      : 'text-matrix-green-dim hover:text-matrix-green hover:bg-matrix-green/5',
                  )}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-matrix-green-dim/20 bg-matrix-bg/95 backdrop-blur-sm"
        aria-label="Navegação principal"
      >
        <ul className="flex justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] transition-colors',
                    isActive
                      ? 'text-matrix-green'
                      : 'text-matrix-green-dim',
                  )}
                >
                  <span className="text-lg" aria-hidden="true">
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
