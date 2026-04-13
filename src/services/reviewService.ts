import { array, object, parse } from 'valibot'
import { get, post } from './apiClient'
import {
  CreateReviewResponseSchema,
  ReviewAsignationSchema,
  ReviewDetailResponseSchema,
  ReviewListResponseSchema,
  type CreateReviewInput,
} from '../schemas/reviewSchema'

const ENDPOINT = '/reviews'
const WorkerAsignationsResponseSchema = object({ data: array(ReviewAsignationSchema) })

export const reviewService = {
  getAll: async () => {
    const result = await get<unknown>(ENDPOINT)
    if ('error' in result) return result
    return { success: true as const, data: parse(ReviewListResponseSchema, result.data) }
  },

  getOne: async (id: number) => {
    const result = await get<unknown>(`${ENDPOINT}/${id}`)
    if ('error' in result) return result
    return { success: true as const, data: parse(ReviewDetailResponseSchema, result.data) }
  },

  getWorkerAsignations: async (workerId: number) => {
    const result = await get<unknown>(`/asignations/worker/${workerId}`)
    if ('error' in result) return result
    return { success: true as const, data: parse(WorkerAsignationsResponseSchema, result.data).data }
  },

  create: async (input: CreateReviewInput) => {
    const result = await post<unknown>(ENDPOINT, input)
    if ('error' in result) return result
    return { success: true as const, data: parse(CreateReviewResponseSchema, result.data) }
  },
}
