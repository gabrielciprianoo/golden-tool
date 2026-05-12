import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false, gcTime: 0 },
  },
})

const mockApiTools = [
  { id: 1, name: 'Taladro Bosch', category: 'normal', price: 1500, supplier: 'Proveedor A', entry_date: '2024-01-15', quantity: 5, unassigned_quantity: 3, warranty: 'con garantia' },
  { id: 2, name: 'Destornillador', category: 'refaccion', price: 150, supplier: 'Proveedor B', entry_date: '2024-02-20', quantity: 20, unassigned_quantity: 15, warranty: 'sin garantia' },
]

vi.mock('../services/apiClient', () => ({
  get: vi.fn((url: string) => {
    if (url === '/tools') {
      return Promise.resolve({ success: true, data: mockApiTools })
    }
    return Promise.resolve({ success: true, data: [] })
  }),
  post: vi.fn(() => Promise.resolve({ success: true, data: { id: 3, name: 'Nueva Tool' } })),
  put: vi.fn(() => Promise.resolve({ success: true, data: { id: 1, name: 'Tool Actualizada' } })),
  del: vi.fn(() => Promise.resolve({ success: true })),
}))

describe('useTools', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createQueryClient()
    queryClient.clear()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  describe('Obtención de herramientas', () => {
    it('debe cargar herramientas del API', async () => {
      const { useTools } = await import('./useTools')

      const { result } = renderHook(() => useTools(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.tools).toHaveLength(2)
      expect(result.current.tools[0].name).toBe('Taladro Bosch')
    })

    it('debe mapear correctamente los datos del API', async () => {
      const { useTools } = await import('./useTools')

      const { result } = renderHook(() => useTools(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const tool = result.current.tools[0]
      expect(tool.id).toBe('1')
      expect(tool.category).toBe('normal')
      expect(tool.status).toBe('active')
    })

    it('debe manejar estado de carga', async () => {
      const { useTools } = await import('./useTools')

      const { result } = renderHook(() => useTools(), { wrapper })

      expect(result.current.isLoading).toBe(true)
    })
  })

  describe('CRUD de herramientas', () => {
    it('debe crear una nueva herramienta', async () => {
      const { useTools } = await import('./useTools')

      const { result } = renderHook(() => useTools(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const newTool = {
        name: 'Nueva Herramienta',
        category: 'normal',
        price: 500,
        supplier: 'Nuevo Proveedor',
        entry_date: '2024-03-01',
        quantity: 10,
        warranty: 'con garantia',
      }

      await act(async () => {
        await result.current.createTool(newTool)
      })

      expect(result.current.isCreating).toBe(false)
    })

    it('debe actualizar una herramienta existente', async () => {
      const { useTools } = await import('./useTools')

      const { result } = renderHook(() => useTools(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const updatedData = {
        name: 'Taladro Actualizado',
        category: 'normal',
        price: 2000,
        supplier: 'Nuevo Proveedor',
        entry_date: '2024-01-15',
        quantity: 15,
        warranty: 'sin garantia',
      }

      await act(async () => {
        await result.current.updateTool({ id: 1, data: updatedData })
      })

      expect(result.current.isUpdating).toBe(false)
    })

    it('debe eliminar una herramienta', async () => {
      const { useTools } = await import('./useTools')

      const { result } = renderHook(() => useTools(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.deleteTool(1)
      })

      expect(result.current.isDeleting).toBe(false)
    })
  })

  describe('Refetch', () => {
    it('debe permitir refetch manual', async () => {
      const { useTools } = await import('./useTools')

      const { result } = renderHook(() => useTools(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const refetchResult = await result.current.refetch()
      expect(refetchResult.data).toBeDefined()
    })
  })

  describe('Estados de carga', () => {
    it('debe manejar isCreating correctamente', async () => {
      const { useTools } = await import('./useTools')

      const { result } = renderHook(() => useTools(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.isCreating).toBe(false)
      expect(result.current.isUpdating).toBe(false)
      expect(result.current.isDeleting).toBe(false)
    })
  })
})