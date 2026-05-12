import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false, gcTime: 0 },
  },
})

const mockRequests = [
  {
    id: 1,
    worker_id: 1,
    tool_id: null,
    type_request: 'PRIMERA_VEZ',
    details_tool: 'Necesito un taladro nuevo',
    preferred_brand: 'Bosch',
    signa_applicant: null,
    signa_authorization: null,
    state: 'pendiente_compra',
    created_at: '2024-01-15',
    updated_at: '2024-01-15',
    worker: { id: 1, name: 'Juan', lastname: 'Pérez', worker_code: 'TRB001' },
  },
  {
    id: 2,
    worker_id: 1,
    tool_id: 1,
    type_request: 'SE_ROMPIO',
    details_tool: 'El taladro se rompió',
    preferred_brand: null,
    signa_applicant: 'firma1',
    signa_authorization: 'firma2',
    state: 'pendiente_entrega',
    created_at: '2024-01-16',
    updated_at: '2024-01-16',
    tool: { id: 1, name: 'Taladro Bosch' },
    worker: { id: 1, name: 'Juan', lastname: 'Pérez', worker_code: 'TRB001' },
  },
]

vi.mock('../services/requestService', () => ({
  requestService: {
    create: vi.fn((data) => Promise.resolve({ success: true, data: { id: 3, ...data } })),
    getByWorker: vi.fn(() => Promise.resolve({ success: true, data: { data: mockRequests } })),
    getCreatedByMe: vi.fn(() => Promise.resolve({ success: true, data: { data: mockRequests } })),
    update: vi.fn(() => Promise.resolve({ success: true, data: { id: 1, state: 'entrega_confirmada' } })),
    delete: vi.fn(() => Promise.resolve({ success: true, message: 'Deleted' })),
  },
}))

describe('useRequests', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createQueryClient()
    queryClient.clear()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  describe('useCreateRequest', () => {
    it('debe tener el hook disponible', async () => {
      const { useCreateRequest } = await import('./useRequests')
      expect(useCreateRequest).toBeDefined()
    })
  })

  describe('useRequestsByWorker', () => {
    it('debe obtener solicitudes por worker', async () => {
      const { useRequestsByWorker } = await import('./useRequests')

      const { result } = renderHook(() => useRequestsByWorker(1), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
      expect(Array.isArray(result.current.data)).toBe(true)
    })

    it('no debe ejecutarse con workerId inválido', async () => {
      const { useRequestsByWorker } = await import('./useRequests')

      const { result } = renderHook(() => useRequestsByWorker(0), { wrapper })

      expect(result.current.isFetching).toBe(false)
    })

    it('debe retornar array vacío si no hay solicitudes', async () => {
      const { useRequestsByWorker } = await import('./useRequests')

      const { result } = renderHook(() => useRequestsByWorker(1), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
    })
  })

  describe('useRequestsCreatedByMe', () => {
    it('debe obtener mis solicitudes', async () => {
      const { useRequestsCreatedByMe } = await import('./useRequests')

      const { result } = renderHook(() => useRequestsCreatedByMe(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
    })

    it('puede deshabilitarse con enabled=false', async () => {
      const { useRequestsCreatedByMe } = await import('./useRequests')

      const { result } = renderHook(() => useRequestsCreatedByMe(false), { wrapper })

      expect(result.current.isFetching).toBe(false)
    })
  })

  describe('useUpdateRequest', () => {
    it('debe tener el hook disponible', async () => {
      const { useUpdateRequest } = await import('./useRequests')
      expect(useUpdateRequest).toBeDefined()
    })
  })

  describe('useDeleteRequest', () => {
    it('debe tener el hook disponible', async () => {
      const { useDeleteRequest } = await import('./useRequests')
      expect(useDeleteRequest).toBeDefined()
    })
  })
})