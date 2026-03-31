import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post, put, del } from '../services/apiClient'
import type { Tool, ToolCategory, ToolStatus } from '../types/inventory'

const GET_ENDPOINT = '/tools'
const MUTATE_ENDPOINT = '/tool'

interface ToolPayload {
  name: string
  category: string
  price: number
  supplier: string
  entry_date: string
  quantity: number
  unassigned_quantity: number
}

interface ApiTool {
  id: number
  name: string
  category: string
  price: number
  supplier: string
  entry_date: string
  quantity: number
  unassigned_quantity: number
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
  status: 'active' as ToolStatus,
})

const getErrorMessage = (res: unknown): string => {
  if (res && typeof res === 'object' && 'error' in res) {
    return (res as { error: string }).error
  }
  return 'Error desconocido'
}

export const useTools = () => {
  const queryClient = useQueryClient()

  const toolsQuery = useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const res = await get<ApiTool[]>(GET_ENDPOINT)
      const isSuccess = 'success' in res && res.success === true
      if (!isSuccess) {
        throw new Error(getErrorMessage(res))
      }
      return (res.data ?? []).map(mapApiTool)
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: ToolPayload) => {
      const res = await post<ApiTool>(MUTATE_ENDPOINT, data)
      const isSuccess = 'success' in res && res.success === true
      if (!isSuccess) {
        throw new Error(getErrorMessage(res))
      }
      if (!res.data) throw new Error('No se recibió datos')
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ToolPayload }) => {
      const res = await put<ApiTool>(`${MUTATE_ENDPOINT}/${id}`, data)
      const isSuccess = 'success' in res && res.success === true
      if (!isSuccess) {
        throw new Error(getErrorMessage(res))
      }
      if (!res.data) throw new Error('No se recibió datos')
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await del(`${MUTATE_ENDPOINT}/${id}`)
      const isSuccess = 'success' in res && res.success === true
      if (!isSuccess) {
        throw new Error(getErrorMessage(res))
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] })
    },
  })

  return {
    tools: toolsQuery.data ?? [],
    isLoading: toolsQuery.isLoading,
    isError: toolsQuery.isError,
    error: toolsQuery.error,
    refetch: toolsQuery.refetch,
    createTool: createMutation.mutateAsync,
    updateTool: updateMutation.mutateAsync,
    deleteTool: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}