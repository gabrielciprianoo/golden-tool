import { useState } from 'react'
import { Outlet, useNavigate, NavLink } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

const IconDashboard = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
)

const IconWorkers = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

const IconInventory = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
)

const IconReviews = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
)

const IconLogout = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

const IconMenu = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)

interface NavItem {
  path: string
  label: string
  Icon: React.FC<{ className?: string }>
}

const navItems: NavItem[] = [
  { path: '/admin', label: 'Panel', Icon: IconDashboard },
  { path: '/admin/workers', label: 'Trabajadores', Icon: IconWorkers },
  { path: '/admin/inventory', label: 'Inventario', Icon: IconInventory },
  { path: '/admin/reviews', label: 'Revisiones', Icon: IconReviews },
]

export const AdminLayout = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen text-left">

      {/* Mobile toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-[200] p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] shadow-sm cursor-pointer"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Abrir menú"
      >
        <IconMenu className="w-5 h-5 text-[var(--text-h)]" />
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-[140]"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
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
        {/* Brand */}
        <div className="px-4 py-4 border-b border-[var(--border)]">
          <p className="text-[15px] font-bold leading-tight m-0" style={{ letterSpacing: '-0.02em' }}>
            <span className="text-[var(--text-h)]">Golden</span>
            <span className="text-primary-600">Tool</span>
          </p>
          <p className="text-[10px] text-[var(--text)] mt-0.5 m-0 truncate">
            Transmisiones Automáticas
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {navItems.map(({ path, label, Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/admin'}
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

        {/* Footer */}
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

      {/* Main content */}
      <div className="flex flex-col flex-1 min-h-screen md:ml-64">

        {/* Top header */}
        <header className="sticky top-0 z-[100] flex items-center justify-between px-6 py-3.5 bg-[var(--bg)] border-b border-[var(--border)]">
          <div className="flex items-baseline gap-3 pl-10 md:pl-0">
            <span className="text-[15px] font-semibold text-[var(--text-h)]">
              Panel de Control
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

        {/* Page content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
