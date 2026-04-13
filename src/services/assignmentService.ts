import { get, post, del, put } from './apiClient'
import type { Assignment, AssignmentInput, AssignmentUpdateInput } from '../types/worker'

export type { AssignmentInput, AssignmentUpdateInput }

const ENDPOINT = '/asignations'

export const assignmentService = {
  getAll: async () => {
    return get<Assignment[]>(ENDPOINT)
  },

  getByWorker: async (workerId: number) => {
    return get<Assignment[]>(`${ENDPOINT}/worker/${workerId}`)
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