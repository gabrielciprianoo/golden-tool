import { get, post, put, del } from './apiClient'

export interface Tool {
  id?: number
  name: string
  category: string
  price: number
  supplier: string
  entryDate: string
  quantity: number
  unassignedQuantity: number
}

export interface ToolPayload {
  name: string
  category: string
  price: number
  supplier: string
  entry_date: string
  quantity: number
  unassigned_quantity: number
}

const GET_ENDPOINT = '/tools'
const MUTATE_ENDPOINT = '/tool'

export const toolService = {
  getAll: async () => {
    return get<Tool[]>(GET_ENDPOINT)
  },

  create: async (data: ToolPayload) => {
    return post<Tool>(MUTATE_ENDPOINT, data)
  },

  update: async (id: number, data: ToolPayload) => {
    return put<Tool>(`${MUTATE_ENDPOINT}/${id}`, data)
  },

  delete: async (id: number) => {
    return del(`${MUTATE_ENDPOINT}/${id}`)
  }
}