import type { ReactNode } from 'react'

interface MainLayoutProps {
  children: ReactNode
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <main className="main-layout">
      {children}
    </main>
  )
}
