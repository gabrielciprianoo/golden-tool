import { useMutation, useQueryClient } from '@tanstack/react-query'
import { requestService, type CreateRequestInput } from '../services/requestService'

export const REQUEST_KEYS = {
  all: ['requests'] as const,
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