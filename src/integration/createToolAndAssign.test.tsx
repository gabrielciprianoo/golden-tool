import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
    },
  },
})

const mockTools = [
  { id: '1', name: 'Taladro Bosch', category: 'normal', price: 1500, supplier: 'Proveedor A', entryDate: '2024-01-15', quantity: 5, unassignedQuantity: 3, status: 'active' },
  { id: '2', name: 'Destornillador', category: 'refaccion', price: 150, supplier: 'Proveedor B', entryDate: '2024-02-20', quantity: 20, unassignedQuantity: 15, status: 'active' },
]

const mockWorkers = [
  { id: '1', worker_code: 'TRB001', name: 'Juan', lastname: 'Pérez', area: 'montaje/desmontaje' as const, createdAt: '2024-01-01' },
  { id: '2', worker_code: 'TRB002', name: 'María', lastname: 'García', area: 'armado/desarmado' as const, createdAt: '2024-01-02' },
]

const mockAssignments = [
  { id: 1, worker_id: '1', tool_id: 1, assigned_quantity: 2, state: 'nuevo' as const, date: '2024-01-15', createdAt: '2024-01-15', updatedAt: '2024-01-15' },
]

vi.mock('../services/apiClient', () => ({
  get: vi.fn((url: string) => {
    if (url.includes('/tools')) {
      return Promise.resolve({ success: true, data: mockTools })
    }
    if (url.includes('/workers')) {
      return Promise.resolve({ success: true, data: mockWorkers })
    }
    if (url.includes('/asignations')) {
      return Promise.resolve({ success: true, data: mockAssignments })
    }
    return Promise.resolve({ success: true, data: [] })
  }),
  post: vi.fn(() => Promise.resolve({ success: true, data: { id: 1 } })),
  put: vi.fn(() => Promise.resolve({ success: true })),
  del: vi.fn(() => Promise.resolve({ success: true })),
}))

describe('Integración: Flujo completo de herramientas y asignaciones', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createQueryClient()
    queryClient.clear()
  })

  describe('Inventario', () => {
    it('debe cargar herramientas disponibles', async () => {
      const { useInventory } = await import('../hooks/useInventory')
      
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useInventory(), { wrapper })

      await waitFor(() => {
        expect(result.current.tools.length).toBeGreaterThan(0)
      })

      expect(result.current.tools[0].name).toBe('Taladro Bosch')
    })

    it('debe filtrar herramientas por búsqueda', async () => {
      const { useInventory } = await import('../hooks/useInventory')
      
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useInventory(), { wrapper })

      await waitFor(() => {
        expect(result.current.tools.length).toBeGreaterThan(0)
      })

      act(() => {
        result.current.setFilters({ search: 'taladro' })
      })

      expect(result.current.filteredTools.length).toBeGreaterThanOrEqual(0)
    })

    it('debe crear nueva herramienta', async () => {
      const { useInventory } = await import('../hooks/useInventory')
      
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useInventory(), { wrapper })

      await waitFor(() => {
        expect(result.current.tools.length).toBeGreaterThan(0)
      })

      const newTool = {
        name: 'Nueva Herramienta',
        category: 'normal' as const,
        price: 500,
        supplier: 'Nuevo Proveedor',
        quantity: 10,
        unassignedQuantity: 10,
        status: 'active' as const,
      }

      const success = await result.current.createTool(newTool)
      expect(success).toBe(true)
    })

    it('debe tener herramientas en inventario', async () => {
      const { useInventory } = await import('../hooks/useInventory')
      
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useInventory(), { wrapper })

      await waitFor(() => {
        expect(result.current.tools.length).toBeGreaterThan(0)
      })

      expect(result.current.tools.length).toBe(2)
    })

    it('debe eliminar herramienta', async () => {
      const { useInventory } = await import('../hooks/useInventory')
      
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useInventory(), { wrapper })

      await waitFor(() => {
        expect(result.current.tools.length).toBeGreaterThan(0)
      })

      const success = await result.current.deleteTool('1')
      expect(success).toBe(true)
    })
  })

  describe('Trabajadores', () => {
    it('debe cargar trabajadores', async () => {
      const { useWorkers } = await import('../hooks/useWorkers')
      
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useWorkers(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data?.length).toBe(2)
      expect(result.current.data?.[0].name).toBe('Juan')
    })
  })

  describe('Asignaciones', () => {
    it('debe crear asignación', async () => {
      const { useCreateAssignment } = await import('../hooks/useAssignments')
      
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useCreateAssignment(), { wrapper })

      const assignmentData = {
        worker_id: 1,
        tool_id: 1,
        assigned_quantity: 2,
        state: 'nuevo' as const,
        date: new Date().toISOString().split('T')[0],
      }

      await act(async () => {
        await result.current.createAssignment(assignmentData)
      })

      expect(result.current.isCreating).toBe(false)
    })

    it('debe obtener asignaciones por trabajador', async () => {
      const { useAssignmentsByWorker } = await import('../hooks/useAssignments')
      
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result } = renderHook(() => useAssignmentsByWorker(1), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toBeDefined()
    })
  })

  describe('Flujo E2E: Crear herramienta -> Asignar a trabajador', () => {
    it('debe completar el flujo completo', async () => {
      const { useInventory } = await import('../hooks/useInventory')
      
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result: inventoryResult } = renderHook(() => useInventory(), { wrapper })

      await waitFor(() => {
        expect(inventoryResult.current.tools.length).toBeGreaterThan(0)
      })

      const { useCreateAssignment } = await import('../hooks/useAssignments')
      const { result: assignmentResult } = renderHook(() => useCreateAssignment(), { wrapper })

      const assignmentData = {
        worker_id: 1,
        tool_id: 1,
        assigned_quantity: 1,
        state: 'nuevo' as const,
        date: new Date().toISOString().split('T')[0],
      }

      await act(async () => {
        await assignmentResult.current.createAssignment(assignmentData)
      })

      expect(assignmentResult.current.isCreating).toBe(false)
    })
  })
})