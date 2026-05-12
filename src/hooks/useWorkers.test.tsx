import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false, gcTime: 0 },
  },
})

const mockWorkers = [
  { id: '1', worker_code: 'TRB001', name: 'Juan', lastname: 'Pérez', area: 'montaje/desmontaje', createdAt: '2024-01-01' },
  { id: '2', worker_code: 'TRB002', name: 'María', lastname: 'García', area: 'armado/desarmado', createdAt: '2024-01-02' },
]

vi.mock('../services/workerService', () => ({
  workerService: {
    getAll: vi.fn(() => Promise.resolve({ success: true, data: mockWorkers })),
    create: vi.fn(() => Promise.resolve({ success: true, data: { id: '3', name: 'Nuevo Worker' } })),
    update: vi.fn(() => Promise.resolve({ success: true })),
    delete: vi.fn(() => Promise.resolve({ success: true })),
  },
}))

describe('useWorkers', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createQueryClient()
    queryClient.clear()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  describe('Obtención de trabajadores', () => {
    it('debe cargar trabajadores del API', async () => {
      const { useWorkers } = await import('./useWorkers')

      const { result } = renderHook(() => useWorkers(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toHaveLength(2)
      expect(result.current.data?.[0].name).toBe('Juan')
    })

    it('debe manejar estado de carga', async () => {
      const { useWorkers } = await import('./useWorkers')

      const { result } = renderHook(() => useWorkers(), { wrapper })

      expect(result.current.isLoading).toBe(true)
    })
  })

  describe('CRUD de trabajadores', () => {
    it('debe tener hooks de mutations disponibles', async () => {
      const { useCreateWorker, useUpdateWorker, useDeleteWorker } = await import('./useWorkers')
      expect(useCreateWorker).toBeDefined()
      expect(useUpdateWorker).toBeDefined()
      expect(useDeleteWorker).toBeDefined()
    })
  })
})