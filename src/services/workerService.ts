import { get, post, del } from './apiClient'
import type { Worker, CreateWorkerInput } from '../types/worker'
import type { ApiResult } from '../types/api'

const BASE_URL = '/workers'

export const workerService = {
  async getAll(): Promise<ApiResult<Worker[]>> {
    return get<Worker[]>(BASE_URL)
  },

  async create(data: CreateWorkerInput): Promise<ApiResult<Worker>> {
    return post<Worker>(BASE_URL, data)
  },

  async delete(id: string): Promise<ApiResult<void>> {
    return del<void>(`${BASE_URL}/${id}`)
  },
}
