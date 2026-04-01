import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { assignmentService, type AssignmentInput, type AssignmentUpdateInput } from '../services/assignmentService'

export const useAssignmentsByWorker = (workerId: number) => {
  return useQuery({
    queryKey: ['assignations', 'worker', workerId],
    queryFn: async () => {
      const res = await assignmentService.getByWorker(workerId)

      const isSuccess = res?.data?.success === true

      if (!isSuccess) {
        throw new Error('Error al obtener asignaciones')
      }

      return res.data.data ?? []
    },
    enabled: !!workerId,
  })
}

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

export const useUpdateAssignment = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: AssignmentUpdateInput }) => {
      return assignmentService.update(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] })
      queryClient.invalidateQueries({ queryKey: ['assignations'] })
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
      queryClient.invalidateQueries({ queryKey: ['tools'] })
      queryClient.invalidateQueries({ queryKey: ['assignations'] })
    },
  })

  return {
    deleteAssignment: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    error: mutation.error,
  }
}