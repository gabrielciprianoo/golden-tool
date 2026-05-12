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

const mockAsignations = [
  { id: 1, tool_id: 1, worker_id: 1, assigned_quantity: 2, state: 'nuevo', date: '2024-01-15' },
  { id: 2, tool_id: 2, worker_id: 1, assigned_quantity: 1, state: 'buen estado', date: '2024-01-15' },
]

vi.mock('../services/workerService', () => ({
  workerService: {
    getAll: vi.fn(() => Promise.resolve({ success: true, data: mockWorkers })),
  },
}))

vi.mock('../services/reviewService', () => ({
  reviewService: {
    getWorkerAsignations: vi.fn(() => Promise.resolve({ success: true, data: mockAsignations })),
    create: vi.fn(() => Promise.resolve({ success: true, data: { id: 1 } })),
  },
}))

vi.mock('../stores/toastStore', () => ({
  useToastStore: () => ({
    addToast: vi.fn(),
  }),
}))

describe('useReviewFlow', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createQueryClient()
    queryClient.clear()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  describe('Estado inicial', () => {
    it('debe tener estado inicial con tab=nueva', async () => {
      const { useReviewFlow } = await import('./useReviewFlow')

      const { result } = renderHook(() => useReviewFlow(), { wrapper })

      expect(result.current.tab).toBe('nueva')
    })

    it('debe tener view inicial', async () => {
      const { useReviewFlow } = await import('./useReviewFlow')

      const { result } = renderHook(() => useReviewFlow(), { wrapper })

      expect(result.current.view).toBeDefined()
    })
  })

  describe('Cambio de estado', () => {
    it('debe cambiar tab correctamente', async () => {
      const { useReviewFlow } = await import('./useReviewFlow')

      const { result } = renderHook(() => useReviewFlow(), { wrapper })

      act(() => {
        result.current.setTab('historial')
      })

      expect(result.current.tab).toBe('historial')
    })

    it('debe limpiar workerSearch', async () => {
      const { useReviewFlow } = await import('./useReviewFlow')

      const { result } = renderHook(() => useReviewFlow(), { wrapper })

      act(() => {
        result.current.setWorkerSearch('test')
      })

      expect(result.current.workerSearch).toBe('test')

      act(() => {
        result.current.setWorkerSearch('')
      })

      expect(result.current.workerSearch).toBe('')
    })
  })

  describe('Funciones del flujo', () => {
    it('debe tener startReview definida', async () => {
      const { useReviewFlow } = await import('./useReviewFlow')

      const { result } = renderHook(() => useReviewFlow(), { wrapper })

      expect(result.current.startReview).toBeDefined()
    })

    it('debe tener cancelReview definida', async () => {
      const { useReviewFlow } = await import('./useReviewFlow')

      const { result } = renderHook(() => useReviewFlow(), { wrapper })

      expect(result.current.cancelReview).toBeDefined()
    })

    it('debe tener completeWizard definida', async () => {
      const { useReviewFlow } = await import('./useReviewFlow')

      const { result } = renderHook(() => useReviewFlow(), { wrapper })

      expect(result.current.completeWizard).toBeDefined()
    })
  })
})