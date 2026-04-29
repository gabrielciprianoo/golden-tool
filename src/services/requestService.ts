import { post } from './apiClient'

export interface CreateRequestInput {
  worker_id: number
  tool_id?: number
  type_request: 'PRIMERA_VEZ' | 'SE_ROMPIO' | 'DESGASTE' | 'SE_PERDIO'
  details_tool: string
  preferred_brand?: string
  signa_applicant?: string
  signa_authorization?: string
}

export const requestService = {
  create: async (data: CreateRequestInput) => {
    return post<{ success: boolean; data: unknown; message: string }>('/requests', data)
  },
}