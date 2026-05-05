import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout, AdminLayout } from './components/templates'
import { HeroSection } from './components/organisms'
import { LoginPage, AdminPage, WorkersPage, InventoryPage, ReviewsPage, WorkerToolManagementPage, RequestsPage } from './pages'
import { useAuthStore } from './stores/authStore'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (requiredType !== undefined && user?.type_user !== requiredType) {
    return <Navigate to={redirectTo} replace />
  }
  
  return <>{children}</>
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => (
  <RouteGuard requiredType={USER_TYPE.ADMIN} redirectTo="/admin">
    {children}
  </RouteGuard>
)

const AdminRoute = ({ children }: { children: React.ReactNode }) => (
  <RouteGuard requiredType={USER_TYPE.WORKER} redirectTo="/home">
    {children}
  </RouteGuard>
)

function App() {
  useEffect(() => {
    useAuthStore.getState().verifyAuth()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HeroSection />} />
          <Route path="requests" element={<RequestsPage />} />
        </Route>
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminPage />} />
          <Route path="workers" element={<WorkersPage />} />
          <Route path="workers/manage/:workerId" element={<WorkerToolManagementPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
        </Route>
      </Routes>
    </QueryClientProvider>
  )
}

export default App