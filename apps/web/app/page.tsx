import { calculateLevel } from '@koda/gamification'

export default function Home() {
  // Teste: importa função pura do package compartilhado
  const level = calculateLevel(0)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="font-display text-4xl font-bold text-matrix-green mb-4"
          style={{ textShadow: '0 0 10px #00FF41, 0 0 20px #00FF41' }}>
        KODA
      </h1>
      <p className="text-matrix-green-dim text-lg mb-8">
        Professor de Programação com IA
      </p>
      <div className="border border-matrix-green-dark/30 rounded-md p-6 bg-matrix-surface">
        <p className="text-matrix-muted text-sm">
          Nível {level.level}: {level.title}
        </p>
        <p className="text-matrix-green mt-2 text-xs">
          Sistema online. Aguardando conexão...
        </p>
      </div>
    </main>
  )
}
