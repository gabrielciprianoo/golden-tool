import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MainLayout, AdminLayout } from './components/templates'
import { HeroSection } from './components/organisms'
import { LoginPage, AdminPage, WorkersPage, InventoryPage, ReviewsPage, WorkerToolManagementPage } from './pages'
import { useAuthStore } from './stores/authStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (user?.role && user.role !== 'admin') {
    return <Navigate to="/home" replace />
  }
  
  return <>{children}</>
}

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
          <Route path="workers/manage/:workerId" element={<WorkerToolManagementPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
        </Route>
      </Routes>
    </QueryClientProvider>
  )
}

export default App