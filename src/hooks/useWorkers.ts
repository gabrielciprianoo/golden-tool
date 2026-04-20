import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { workerService } from '../services/workerService'
import type { CreateWorkerInput } from '../types/worker'

export const WORKER_KEYS = {
  all: ['workers'] as const,
  lists: () => [...WORKER_KEYS.all, 'list'] as const,
  list: () => [...WORKER_KEYS.lists()] as const,
}

export const useWorkers = () => {
  return useQuery({
    queryKey: WORKER_KEYS.list(),
    queryFn: async () => {
      const result = await workerService.getAll()
      if (!result.success) {
        throw new Error('error' in result ? result.error : 'Error al cargar trabajadores')
      }
      if (!result.data) {
        throw new Error('No se recibieron datos')
      }
      return result.data
    },
  })
}

export const useCreateWorker = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateWorkerInput) => workerService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKER_KEYS.all })
    },
  })
}

export const useUpdateWorker = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateWorkerInput }) =>
      workerService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKER_KEYS.all })
    },
  })
}

export const useDeleteWorker = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => workerService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKER_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ['tools'] })
    },
  })
}
