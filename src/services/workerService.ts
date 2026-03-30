import { get, post, put, patch, del } from './apiClient'
import type { Worker, CreateWorkerInput } from '../types/worker'
import type { ApiResult } from '../types/api'

const BASE_URL = '/workers'

export const workerService = {
  async getAll(): Promise<ApiResult<Worker[]>> {
    const result = await get<Worker[]>(BASE_URL)
    return result
  },

async create(data: CreateWorkerInput): Promise<ApiResult<Worker>> {
  return post<Worker>(BASE_URL, {
    name: data.name,
    lastname: data.lastName,
    area: data.area,
  })
},

 async update(id: string, data: CreateWorkerInput): Promise<ApiResult<Worker>> {
  return put<Worker>(`${BASE_URL}/${id}`, {
    name: data.name,
    lastname: data.lastName,
    area: data.area,
  })
},

  async patch(id: string, data: Partial<CreateWorkerInput>): Promise<ApiResult<Worker>> {
    return patch<Worker>(`${BASE_URL}/${id}`, data)
  },

  async delete(id: string): Promise<ApiResult<void>> {
    return del<void>(`${BASE_URL}/${id}`)
  },
}