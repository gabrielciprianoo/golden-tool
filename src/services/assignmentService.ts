import { get, post } from './apiClient'
import type { Assignment, AssignmentInput } from '../types/worker'

export type { AssignmentInput }

const ENDPOINT = '/asignations'

export const assignmentService = {
  getAll: async () => {
    return get<Assignment[]>(ENDPOINT)
  },

  create: async (data: AssignmentInput) => {
    return post<Assignment>(ENDPOINT, data)
  },
}