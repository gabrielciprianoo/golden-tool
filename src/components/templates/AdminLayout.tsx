import { useState } from 'react'
import { Outlet, useNavigate, NavLink } from 'react-router-dom'
import { Button } from '../atoms'
import { logout, clearAuth, getCurrentUser } from '../../services/authService'

interface NavItem {
  path: string
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { path: '/admin', label: 'Dashboard', icon: '📊' },
  { path: '/admin/workers', label: 'Trabajadores', icon: '👷' },
  { path: '/admin/inventory', label: 'Inventario', icon: '📦' },
  { path: '/admin/reviews', label: 'Revisiones', icon: '🔧' },
]

export const AdminLayout = () => {
  const navigate = useNavigate()
  const user = getCurrentUser()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    clearAuth()
    navigate('/login')
  }

  const handleNavClick = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="admin-layout">
      <button 
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        ☰
      </button>

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar__header">
          <span className="admin-sidebar__logo">🛠️</span>
          <span className="admin-sidebar__title">Golden Tool</span>
        </div>

        <nav className="admin-sidebar__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) => 
                `admin-sidebar__link ${isActive ? 'active' : ''}`
              }
              onClick={handleNavClick}
            >
              <span className="admin-sidebar__icon">{item.icon}</span>
              <span className="admin-sidebar__label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="admin-content">
        <header className="admin-header">
          <div className="admin-header__left">
            <h1 className="admin-header__title">Golden Tool</h1>
            <span className="admin-header__subtitle">Panel de Administración</span>
          </div>
          <div className="admin-header__right">
            {user && (
              <span className="admin-header__user">{user.name}</span>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout} className="header-logout">
              Cerrar Sesión
            </Button>
          </div>
        </header>
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
