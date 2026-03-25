import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout, AdminLayout } from './components/templates'
import { HeroSection } from './components/organisms'
import { LoginPage, AdminPage, WorkersPage, InventoryPage, ReviewsPage } from './pages'
import { useAuthStore } from './stores/authStore'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function App() {
  const verifyAuth = useAuthStore((state) => state.verifyAuth)

  useEffect(() => {
    verifyAuth()
  }, [])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route 
        path="/home" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <HeroSection />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminPage />} />
        <Route path="workers" element={<WorkersPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
      </Route>
    </Routes>
  )
}

export default App