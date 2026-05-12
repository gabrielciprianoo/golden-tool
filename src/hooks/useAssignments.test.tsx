import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false, gcTime: 0 },
  },
})

const mockAssignments = [
  { id: 1, worker_id: '1', tool_id: 1, assigned_quantity: 2, state: 'nuevo', date: '2024-01-15', createdAt: '2024-01-15', updatedAt: '2024-01-15' },
  { id: 2, worker_id: '1', tool_id: 2, assigned_quantity: 1, state: 'buen estado', date: '2024-01-15', createdAt: '2024-01-15', updatedAt: '2024-01-15' },
]

vi.mock('../services/assignmentService', () => ({
  assignmentService: {
    getByWorker: vi.fn(() => Promise.resolve({ success: true, data: mockAssignments })),
    create: vi.fn(() => Promise.resolve({ success: true, data: { id: 3 } })),
    update: vi.fn(() => Promise.resolve({ success: true })),
    delete: vi.fn(() => Promise.resolve({ success: true })),
  },
}))

describe('useAssignments', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createQueryClient()
    queryClient.clear()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  describe('Obtención de asignaciones', () => {
    it('debe obtener asignaciones por worker', async () => {
      const { useAssignmentsByWorker } = await import('./useAssignments')

      const { result } = renderHook(() => useAssignmentsByWorker(1), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toBeDefined()
    })

    it('no debe ejecutarse con workerId inválido', async () => {
      const { useAssignmentsByWorker } = await import('./useAssignments')

      const { result } = renderHook(() => useAssignmentsByWorker(0), { wrapper })

      expect(result.current.isFetching).toBe(false)
    })
  })

  describe('Mutations', () => {
    it('debe tener useCreateAssignment disponible', async () => {
      const { useCreateAssignment } = await import('./useAssignments')
      expect(useCreateAssignment).toBeDefined()
    })

    it('debe tener useUpdateAssignment disponible', async () => {
      const { useUpdateAssignment } = await import('./useAssignments')
      expect(useUpdateAssignment).toBeDefined()
    })

    it('debe tener useDeleteAssignment disponible', async () => {
      const { useDeleteAssignment } = await import('./useAssignments')
      expect(useDeleteAssignment).toBeDefined()
    })
  })
})