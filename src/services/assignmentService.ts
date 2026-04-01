import { get, post, del } from './apiClient'
import type { Assignment, AssignmentInput } from '../types/worker'

export type { AssignmentInput }

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

  delete: async (id: number) => {
    return del(`${ENDPOINT}/${id}`)
  },
}