import { MainLayout } from '../components/templates'

export const AdminPage = () => {
  return (
    <MainLayout>
      <div className="admin-welcome">
        <h2>Bienvenido al panel de administracion</h2>
        <p>Seleccione una opción del menú para comenzar.</p>
      </div>
    </MainLayout>
  )
}