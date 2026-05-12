import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
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
  get: vi.fn(() => Promise.resolve({ success: true, data: mockApiTools })),
}))

describe('useAvailableTools', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createQueryClient()
    queryClient.clear()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  describe('Obtención de herramientas disponibles', () => {
    it('debe cargar herramientas disponibles del API', async () => {
      const { useAvailableTools } = await import('./useAvailableTools')

      const { result } = renderHook(() => useAvailableTools(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.tools).toHaveLength(2)
      expect(result.current.tools[0].name).toBe('Taladro Bosch')
    })

    it('debe mapear correctamente los datos', async () => {
      const { useAvailableTools } = await import('./useAvailableTools')

      const { result } = renderHook(() => useAvailableTools(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const tool = result.current.tools[0]
      expect(tool.id).toBe('1')
      expect(tool.status).toBe('active')
    })

    it('debe manejar enabled=false', async () => {
      const { useAvailableTools } = await import('./useAvailableTools')

      const { result } = renderHook(() => useAvailableTools(false), { wrapper })

      expect(result.current.isLoading).toBe(false)
    })

    it('debe permitir refetch manual', async () => {
      const { useAvailableTools } = await import('./useAvailableTools')

      const { result } = renderHook(() => useAvailableTools(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const refetchResult = await result.current.refetch()
      expect(refetchResult.data).toBeDefined()
    })
  })
})