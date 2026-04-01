import { Sidebar } from '@/components/sidebar'

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col pb-16 md:pb-0">{children}</main>
    </div>
  )
}
