import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false, gcTime: 0 },
  },
})

const mockReviews = [
  {
    id: 1,
    worker_id: 1,
    created_at: '2024-01-15',
    updated_at: '2024-01-15',
    worker: { id: 1, name: 'Juan', lastname: 'Pérez', worker_code: 'TRB001' },
    results: [],
  },
  {
    id: 2,
    worker_id: 2,
    created_at: '2024-01-16',
    updated_at: '2024-01-16',
    worker: { id: 2, name: 'María', lastname: 'García', worker_code: 'TRB002' },
    results: [],
  },
]

const mockAsignations = [
  { id: 1, tool_id: 1, worker_id: 1, assigned_quantity: 2, state: 'nuevo', date: '2024-01-15' },
  { id: 2, tool_id: 2, worker_id: 1, assigned_quantity: 1, state: 'buen estado', date: '2024-01-15' },
]

vi.mock('../services/reviewService', () => ({
  reviewService: {
    getAll: vi.fn(() => Promise.resolve({ success: true, data: { data: mockReviews } })),
    getOne: vi.fn((id: number) => Promise.resolve({ success: true, data: { data: mockReviews.find(r => r.id === id) } })),
    getWorkerAsignations: vi.fn(() => Promise.resolve({ success: true, data: mockAsignations })),
    create: vi.fn((input) => Promise.resolve({ success: true, data: { id: 3, ...input } })),
  },
}))

describe('useReviews', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createQueryClient()
    queryClient.clear()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  describe('useReviews', () => {
    it('debe obtener lista de revisiones', async () => {
      const { useReviews } = await import('./useReviews')

      const { result } = renderHook(() => useReviews(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
    })

    it('debe obtener revisiones exitosamente', async () => {
      const { useReviews } = await import('./useReviews')

      const { result } = renderHook(() => useReviews(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
    })
  })

  describe('useReview', () => {
    it('debe obtener detalle de revisión por ID', async () => {
      const { useReview } = await import('./useReviews')

      const { result } = renderHook(() => useReview(1), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
    })

    it('no debe ejecutarse sin ID (id=null)', async () => {
      const { useReview } = await import('./useReviews')

      const { result } = renderHook(() => useReview(null), { wrapper })

      expect(result.current.isFetching).toBe(false)
    })

    it('debe tener los hooks disponibles', async () => {
      const { useReview, useReviews, useCreateReview } = await import('./useReviews')
      expect(useReview).toBeDefined()
      expect(useReviews).toBeDefined()
      expect(useCreateReview).toBeDefined()
    })
  })

  describe('useWorkerAsignationsForReview', () => {
    it('debe obtener asignaciones por worker', async () => {
      const { useWorkerAsignationsForReview } = await import('./useReviews')

      const { result } = renderHook(() => useWorkerAsignationsForReview(1), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
      expect(Array.isArray(result.current.data)).toBe(true)
    })

    it('no debe ejecutarse sin workerId (workerId=null)', async () => {
      const { useWorkerAsignationsForReview } = await import('./useReviews')

      const { result } = renderHook(() => useWorkerAsignationsForReview(null), { wrapper })

      expect(result.current.isFetching).toBe(false)
    })
  })

  describe('useCreateReview', () => {
    it('debe tener el hook disponible', async () => {
      const { useCreateReview } = await import('./useReviews')
      expect(useCreateReview).toBeDefined()
    })
  })
})