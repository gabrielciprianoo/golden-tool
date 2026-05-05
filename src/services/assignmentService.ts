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
    if (!result.success) return result
    return { success: true, data: result.data?.data ?? [] }
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