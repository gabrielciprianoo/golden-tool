import { useMutation, useQueryClient } from '@tanstack/react-query'
import { assignmentService, type AssignmentInput } from '../services/assignmentService'

export const useCreateAssignment = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (data: AssignmentInput) => {
      return assignmentService.create(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] })
      queryClient.invalidateQueries({ queryKey: ['assignations'] })
    },
  })

  return {
    createAssignment: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
  }
}