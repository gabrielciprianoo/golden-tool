import { Outlet, useNavigate } from 'react-router-dom'
import { Button } from '../atoms'
import { logout, clearAuth, getCurrentUser } from '../../services/authService'

export const AdminLayout = () => {
  const navigate = useNavigate()
  const user = getCurrentUser()

  const handleLogout = async () => {
    await logout()
    clearAuth()
    navigate('/login')
  }

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-header__left">
          <h1 className="admin-header__title">Golden Tool</h1>
          <span className="admin-header__subtitle">Panel de Administración</span>
        </div>
        <div className="admin-header__right">
          {user && (
            <span className="admin-header__user">{user.name}</span>
          )}
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </div>
      </header>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
