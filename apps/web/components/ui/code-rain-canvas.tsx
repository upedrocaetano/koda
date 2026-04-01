'use client'

import { useEffect, useRef, useCallback } from 'react'

interface CodeRainCanvasProps {
  opacity?: number
  speed?: number
  density?: number
  className?: string
}

const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF'
const FONT_SIZE = 14

export function CodeRainCanvas({
  opacity = 0.05,
  speed = 2,
  density = 1,
  className = '',
}: CodeRainCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dropsRef = useRef<number[]>([])
  const animationRef = useRef<number>(0)

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.fillStyle = `rgba(13, 13, 13, ${0.05 * speed})`
      ctx.fillRect(0, 0, width, height)

      ctx.fillStyle = '#00FF41'
      ctx.font = `${FONT_SIZE}px monospace`

      const drops = dropsRef.current
      const columns = drops.length

      for (let i = 0; i < columns; i++) {
        if (Math.random() > 0.3 * density) continue

        const char = CHARS[Math.floor(Math.random() * CHARS.length)]
        const x = i * FONT_SIZE
        const y = drops[i] * FONT_SIZE

        ctx.globalAlpha = 0.5 + Math.random() * 0.5
        ctx.fillText(char, x, y)

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i] += speed * 0.5
      }

      ctx.globalAlpha = 1
    },
    [speed, density],
  )

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      const columns = Math.floor(canvas.width / FONT_SIZE)
      dropsRef.current = Array.from({ length: columns }, () =>
        Math.random() * (canvas.height / FONT_SIZE),
      )
    }

    resize()
    window.addEventListener('resize', resize)

    const animate = () => {
      draw(ctx, canvas.width, canvas.height)
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationRef.current)
    }
  }, [draw])

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none fixed inset-0 z-0 ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    />
  )
}
