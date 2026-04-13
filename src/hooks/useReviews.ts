import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { reviewService } from '../services/reviewService'
import type { CreateReviewInput } from '../schemas/reviewSchema'

export const REVIEW_KEYS = {
  all: ['reviews'] as const,
  list: () => [...REVIEW_KEYS.all, 'list'] as const,
  detail: (id: number) => [...REVIEW_KEYS.all, id] as const,
  workerAsignations: (workerId: number) => ['review-asignations', workerId] as const,
}

export const useReviews = () => {
  return useQuery({
    queryKey: REVIEW_KEYS.list(),
    queryFn: async () => {
      const result = await reviewService.getAll()
      if ('error' in result) throw new Error(result.error)
      return result.data.data
    },
  })
}

export const useReview = (id: number | null) => {
  return useQuery({
    queryKey: REVIEW_KEYS.detail(id ?? 0),
    queryFn: async () => {
      if (id === null) throw new Error('No review id')
      const result = await reviewService.getOne(id)
      if ('error' in result) throw new Error(result.error)
      return result.data.data
    },
    enabled: id !== null,
  })
}

export const useWorkerAsignationsForReview = (workerId: number | null) => {
  return useQuery({
    queryKey: REVIEW_KEYS.workerAsignations(workerId ?? 0),
    queryFn: async () => {
      if (workerId === null) throw new Error('No worker id')
      const result = await reviewService.getWorkerAsignations(workerId)
      if ('error' in result) throw new Error(result.error)
      return result.data
    },
    enabled: workerId !== null,
  })
}

export const useCreateReview = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateReviewInput) => reviewService.create(input),
    onSuccess: (_, variables) => {
      // Reviews list
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.all })
      // Asignations — states updated, some deleted
      queryClient.invalidateQueries({ queryKey: ['assignations'] })
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.workerAsignations(variables.worker_id) })
      // Tools — quantities change when tools are lost
      queryClient.invalidateQueries({ queryKey: ['tools'] })
    },
  })
}
