import type { ReactNode } from 'react'
import { useAuthStore } from '../../stores/authStore'

interface MainLayoutProps {
  children: ReactNode
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const user = useAuthStore((state) => state.user)

  return (
    <main className="main-layout">
      {user?.type_user === 0 && (
        <div className="bg-surface-100 border-b border-surface-200 px-6 py-3 text-center">
          <p className="text-sm text-surface-600">
            Sesión de usuario normal - Solo tienes acceso a funciones de consulta
          </p>
        </div>
      )}
      {children}
    </main>
  )
}
