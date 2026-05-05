import { useQuery } from '@tanstack/react-query'
import { get } from '../services/apiClient'
import type { Tool, ToolCategory, ToolStatus } from '../types/inventory'

interface ApiTool {
  id: number
  name: string
  category: string
  price: number
  supplier: string
  entry_date: string
  quantity: number
  unassigned_quantity: number
  warranty: string
}

const mapApiTool = (item: ApiTool): Tool => ({
  id: String(item.id),
  name: item.name,
  category: item.category as ToolCategory,
  price: item.price,
  supplier: item.supplier,
  quantity: item.quantity,
  unassignedQuantity: item.unassigned_quantity,
  entryDate: item.entry_date,
  status: (item.warranty === 'con garantia' ? 'active' : 'inactive') as ToolStatus,
})

const getErrorMessage = (res: unknown): string => {
  if (res && typeof res === 'object' && 'error' in res) {
    return (res as { error: string }).error
  }
  return 'Error desconocido'
}

export const useAvailableTools = (enabled = true) => {
  const toolsQuery = useQuery({
    queryKey: ['availableTools'],
    queryFn: async () => {
      const res = await get<ApiTool[]>('/tools')
      const isSuccess = 'success' in res && res.success === true
      if (!isSuccess) {
        throw new Error(getErrorMessage(res))
      }
      return (res.data ?? []).map(mapApiTool)
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled,
  })

  return {
    tools: toolsQuery.data ?? [],
    isLoading: toolsQuery.isLoading,
    isError: toolsQuery.isError,
    error: toolsQuery.error,
    refetch: toolsQuery.refetch,
  }
}