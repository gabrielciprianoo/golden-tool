import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { requestService, type CreateRequestInput, type RequestData, type UpdateRequestInput } from '../services/requestService'

export const REQUEST_KEYS = {
  all: ['requests'] as const,
  byWorker: (workerId: number) => ['requests', 'worker', workerId] as const,
  createdByMe: ['requests', 'created-by-me'] as const,
}

export const useCreateRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateRequestInput) => requestService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REQUEST_KEYS.all })
    },
  })
}

export const useRequestsByWorker = (workerId: number, enabled = true, refreshKey?: number) => {
  return useQuery({
    queryKey: [...REQUEST_KEYS.byWorker(workerId), refreshKey ?? 0],
    queryFn: async () => {
      const response = await requestService.getByWorker(workerId)
      if ('error' in response) {
        throw new Error(response.error || 'Error al obtener solicitudes')
      }
      return (response.data?.data ?? []) as RequestData[]
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: enabled && workerId > 0,
  })
}

export const useRequestsCreatedByMe = (enabled = true, refreshKey?: number) => {
  return useQuery({
    queryKey: [...REQUEST_KEYS.createdByMe, refreshKey ?? 0],
    queryFn: async () => {
      const response = await requestService.getCreatedByMe()
      if ('error' in response) {
        throw new Error(response.error || 'Error al obtener solicitudes')
      }
      return (response.data?.data ?? []) as RequestData[]
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled,
  })
}

export const useUpdateRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRequestInput }) =>
      requestService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: REQUEST_KEYS.byWorker(variables.id) })
    },
  })
}

export const useDeleteRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => requestService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REQUEST_KEYS.all })
    },
  })
}