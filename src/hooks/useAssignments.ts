import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { assignmentService, type AssignmentInput } from '../services/assignmentService'

const getErrorMessage = (res: unknown): string => {
  if (res && typeof res === 'object' && 'error' in res) {
    return (res as { error: string }).error
  }
  return 'Error desconocido'
}

export const useAssignmentsByWorker = (workerId: number) => {
  return useQuery({
    queryKey: ['assignations', 'worker', workerId],
    queryFn: async () => {
      const res = await assignmentService.getByWorker(workerId)

      console.log("RESPUESTA COMPLETA:", res)

      const isSuccess = res?.data?.success === true

      if (!isSuccess) {
        throw new Error('Error al obtener asignaciones')
      }

      return res.data.data ?? [] // 🔥 ESTA ES LA LÍNEA CLAVE
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