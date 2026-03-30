import { get, post, put, patch, del } from './apiClient'
import type { Worker, CreateWorkerInput } from '../types/worker'
import type { ApiResult } from '../types/api'

const BASE_URL = '/workers'

export const workerService = {
  async getAll(): Promise<ApiResult<Worker[]>> {
    const result = await get<any>(BASE_URL)

console.log('GET WORKERS RESPONSE:', result)

    if (result.success && result.data) {
      return {
        success: true,
        data: result.data, // 🔥 aquí extraemos el array real
      }
    }

    return {
      success: false,
      error: result.error,
    }
  },

async create(data: CreateWorkerInput): Promise<ApiResult<Worker>> {
  return post<Worker>(BASE_URL, {
    name: data.name,
    lastname: data.lastName, // 🔥 mapeo limpio aquí
    area: data.area,
  })
},

  async update(id: string, data: CreateWorkerInput): Promise<ApiResult<Worker>> {
    return put<Worker>(`${BASE_URL}/${id}`, data)
  },

  async patch(id: string, data: Partial<CreateWorkerInput>): Promise<ApiResult<Worker>> {
    return patch<Worker>(`${BASE_URL}/${id}`, data)
  },

  async delete(id: string): Promise<ApiResult<void>> {
    return del<void>(`${BASE_URL}/${id}`)
  },
}