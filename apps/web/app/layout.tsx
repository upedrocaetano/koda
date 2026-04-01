import type { Metadata } from 'next'
import { Orbitron, Share_Tech_Mono, Inter, Fira_Code } from 'next/font/google'
import '@/styles/globals.css'

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const shareTechMono = Share_Tech_Mono({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-code',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Koda — Professor de Programação com IA',
  description: 'Aprenda programação do zero com o Koda, seu professor de IA com tema Matrix.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${orbitron.variable} ${shareTechMono.variable} ${inter.variable} ${firaCode.variable}`}>
      <body className="bg-matrix-bg text-matrix-white font-mono antialiased">
        {children}
      </body>
    </html>
  )
}
