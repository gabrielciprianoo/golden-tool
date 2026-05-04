import { post, get, patch } from './apiClient'

export interface CreateRequestInput {
  worker_id: number
  tool_id?: number
  type_request: 'PRIMERA_VEZ' | 'SE_ROMPIO' | 'DESGASTE' | 'SE_PERDIO'
  details_tool: string
  preferred_brand?: string
  signa_applicant?: string
  signa_authorization?: string
}

export interface RequestData {
  id: number
  worker_id: number
  tool_id: number | null
  type_request: string
  details_tool: string
  preferred_brand: string | null
  signa_applicant: string | null
  signa_authorization: string | null
  state: 'incompleta' | 'pendiente_aprobacion' | 'cancelada'
  created_at: string
  updated_at: string
  tool?: {
    id: number
    name: string
  }
}

export interface UpdateRequestInput {
  signa_applicant?: string
  signa_authorization?: string
}

export const requestService = {
  create: async (data: CreateRequestInput) => {
    return post<{ success: boolean; data: unknown; message: string }>('/requests', data)
  },
  getByWorker: async (workerId: number) => {
    return get<{ success: boolean; data: RequestData[] }>(`/requests/worker/${workerId}`)
  },
  update: async (id: number, data: UpdateRequestInput) => {
    return patch<{ success: boolean; data: RequestData; message: string }>(`/requests/${id}`, data)
  },
}