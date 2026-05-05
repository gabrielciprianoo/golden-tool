import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { assignmentService, type AssignmentInput, type AssignmentUpdateInput } from '../services/assignmentService'

export const useAssignmentsByWorker = (workerId: number, enabled = true) => {
  return useQuery({
    queryKey: ['assignations', 'worker', workerId],
    queryFn: async () => {
      const res = await assignmentService.getByWorker(workerId)

      if (!res.success) {
        throw new Error('Error al obtener asignaciones')
      }

      return res.data ?? []
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: enabled && !!workerId,
  })
}

export const useCreateAssignment = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (data: AssignmentInput) => {
      return assignmentService.create(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableTools'] })
      queryClient.invalidateQueries({ queryKey: ['assignations'] })
      queryClient.invalidateQueries({ queryKey: ['assignations', 'worker'] })
    },
  })

  return {
    createAssignment: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
  }
}

export const useUpdateAssignment = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: AssignmentUpdateInput }) => {
      return assignmentService.update(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableTools'] })
      queryClient.invalidateQueries({ queryKey: ['assignations'] })
      queryClient.invalidateQueries({ queryKey: ['assignations', 'worker'] })
    },
  })

  return {
    updateAssignment: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error,
  }
}

export const useDeleteAssignment = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (id: number) => {
      return assignmentService.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableTools'] })
      queryClient.invalidateQueries({ queryKey: ['assignations'] })
      queryClient.invalidateQueries({ queryKey: ['assignations', 'worker'] })
    },
  })

  return {
    deleteAssignment: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    error: mutation.error,
  }
}