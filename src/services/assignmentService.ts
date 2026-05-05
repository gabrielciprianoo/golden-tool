import { get, post, del, put } from './apiClient'
import type { Assignment, AssignmentInput, AssignmentUpdateInput } from '../types/worker'

export type { AssignmentInput, AssignmentUpdateInput }

const ENDPOINT = '/asignations'

export const assignmentService = {
  getAll: async () => {
    return get<Assignment[]>(ENDPOINT)
  },

  getByWorker: async (workerId: number) => {
    const result = await get<{ data: Assignment[] }>(`${ENDPOINT}/worker/${workerId}`)
    if (!result.success) {
      return { success: false, error: 'Error fetching', statusCode: 500 } as const
    }
    return { success: true as const, data: result.data?.data ?? [] }
  },

  create: async (data: AssignmentInput) => {
    return post<Assignment>(ENDPOINT, data)
  },

  update: async (id: number, data: AssignmentUpdateInput) => {
    return put<Assignment>(`${ENDPOINT}/${id}`, data)
  },

  delete: async (id: number) => {
    return del(`${ENDPOINT}/${id}`)
  },
}