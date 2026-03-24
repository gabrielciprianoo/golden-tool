import { MainLayout } from '../components/templates'

export const AdminPage = () => {
  return (
    <MainLayout>
      <div className="admin-welcome">
        <h2>Bienvenido al Panel de Administración</h2>
        <p>Selecciona una opción del menú para comenzar.</p>
      </div>
    </MainLayout>
  )
}
