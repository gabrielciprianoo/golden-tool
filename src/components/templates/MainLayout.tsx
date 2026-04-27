import { useState } from 'react'
import type { ReactNode } from 'react'
import { Outlet, useNavigate, NavLink } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { IconDashboard, IconWorkers, IconLogout, IconMenu } from '../atoms'

interface NavItem {
  path: string
  label: string
  Icon: React.FC<{ className?: string }>
}

const navItems: NavItem[] = [
  { path: '/home', label: 'Panel', Icon: IconDashboard },
  { path: '/home/requests', label: 'Solicitudes', Icon: IconWorkers },
]

interface MainLayoutProps {
  children?: ReactNode
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  if (user?.type_user === 0) {
    return (
      <div className="flex min-h-screen text-left">
        <button
          className="md:hidden fixed top-4 left-4 z-[200] p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] shadow-sm cursor-pointer"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Abrir menú"
        >
          <IconMenu className="w-5 h-5 text-[var(--text-h)]" />
        </button>

        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-[140]"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={[
            'fixed top-0 left-0 h-screen w-64 z-[150]',
            'flex flex-col',
            'bg-[var(--bg)] border-r border-[var(--border)]',
            'transition-transform duration-200 ease-in-out',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
            'md:translate-x-0',
          ].join(' ')}
        >
          <div className="px-4 py-4 border-b border-[var(--border)]">
            <p className="text-[15px] font-bold leading-tight m-0" style={{ letterSpacing: '-0.02em' }}>
              <span className="text-[var(--text-h)]">Golden</span>
              <span className="text-primary-600">Tool</span>
            </p>
            <p className="text-[10px] text-[var(--text)] mt-0.5 m-0 truncate">
              Transmisiones Automáticas
            </p>
          </div>

          <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
            {navItems.map(({ path, label, Icon }) => (
              <NavLink
                key={path}
                to={path}
                end={path === '/home'}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm',
                    'border-l-[3px] transition-all duration-150',
                    isActive
                      ? 'border-[var(--accent)] bg-[var(--accent-bg)] text-[var(--accent)] font-semibold'
                      : 'border-transparent text-[var(--text)] hover:bg-[var(--accent-bg)] hover:text-[var(--text-h)]',
                  ].join(' ')
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="px-4 py-4 border-t border-[var(--border)]">
            {user && (
              <p className="text-xs text-[var(--text)] px-1 mb-3 truncate">{user.name}</p>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm text-[var(--text)] border border-[var(--border)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)] hover:border-[var(--accent-border)] transition-all duration-150 cursor-pointer"
            >
              <IconLogout className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </aside>

        <div className="flex flex-col flex-1 min-h-screen md:ml-64">
          <header className="sticky top-0 z-[100] flex items-center justify-between px-6 py-3.5 bg-[var(--bg)] border-b border-[var(--border)]">
            <div className="flex items-baseline gap-3 pl-10 md:pl-0">
              <span className="text-[15px] font-semibold text-[var(--text-h)]">
                Panel de Usuario
              </span>
              <span className="hidden md:inline text-xs text-[var(--text)]">
                Transmisiones Automáticas Golden Gate
              </span>
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <span className="hidden md:inline text-sm text-[var(--text)]">{user.name}</span>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-[var(--text)] border border-[var(--border)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)] hover:border-[var(--accent-border)] transition-all duration-150 cursor-pointer"
              >
                <IconLogout className="w-3.5 h-3.5" />
                <span className="md:hidden">Salir</span>
                <span className="hidden md:inline">Cerrar Sesión</span>
              </button>
            </div>
          </header>

          <main className="flex-1 p-8">
            <Outlet />
          </main>
        </div>
      </div>
    )
  }

  return (
    <main className="main-layout">
      {children}
    </main>
  )
}
