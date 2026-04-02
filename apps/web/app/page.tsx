import Link from 'next/link'
import { calculateLevel } from '@koda/gamification'
import {
  MatrixButton,
  MatrixCard,
  MatrixBadge,
  MatrixProgressBar,
} from '@/components/ui'

export default function Home() {
  const level = calculateLevel(180)

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-8">
      <h1
        className="font-display text-5xl font-bold text-matrix-green mb-2"
        style={{ textShadow: '0 0 10px #00FF41, 0 0 20px #00FF41' }}
      >
        KODA
      </h1>
      <p className="text-matrix-green-dim text-lg mb-10">
        Professor de Programação com IA
      </p>

      <div className="grid w-full max-w-2xl gap-6">
        <MatrixCard
          header={
            <div className="flex items-center justify-between">
              <span className="text-matrix-green text-sm font-medium">
                Nível {level.level}: {level.title}
              </span>
              <MatrixBadge variant="level" label={`Nível ${level.level}`} />
            </div>
          }
        >
          <MatrixProgressBar
            value={(180 / 500) * 100}
            label="XP para próximo nível"
            showPercentage
          />
          <div className="mt-4 flex gap-2">
            <MatrixBadge variant="xp" label="180 XP" />
            <MatrixBadge variant="streak" label="3 dias" />
          </div>
        </MatrixCard>

        <MatrixCard scanlines>
          <p className="text-matrix-green-dim text-sm italic mb-1">
            &ldquo;Não existe colher. Existe apenas o código.&rdquo;
          </p>
          <p className="text-matrix-muted text-xs">— Koda</p>
        </MatrixCard>

        <div className="flex flex-wrap gap-3">
          <Link href="/chat">
            <MatrixButton variant="primary">Começar aula</MatrixButton>
          </Link>
          <Link href="/progress">
            <MatrixButton variant="secondary">Ver progresso</MatrixButton>
          </Link>
          <Link href="/profile">
            <MatrixButton variant="ghost">Configurações</MatrixButton>
          </Link>
          <Link href="/login">
            <MatrixButton variant="danger">Entrar</MatrixButton>
          </Link>
        </div>
      </div>

      <p className="mt-10 text-matrix-muted text-xs">
        Sistema online. Aguardando conexão...
      </p>
    </main>
  )
}
