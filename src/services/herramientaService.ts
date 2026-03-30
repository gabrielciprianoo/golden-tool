import { get, post, put, del } from './apiClient'

export interface Herramienta {
  id?: number
  nombre: string
  categoria: string
  precio: number
  proveedor: string
  fecha_ingreso: string
  cantidad: number
  cantidad_no_asignada: number
}

const GET_ENDPOINT = '/tools'
const MUTATE_ENDPOINT = '/tool'

export const herramientaService = {
  getAll: async () => {
    return get<Herramienta[]>(GET_ENDPOINT)
  },

  create: async (data: Herramienta) => {
    return post<Herramienta>(MUTATE_ENDPOINT, data)
  },

  update: async (id: number, data: Herramienta) => {
    return put<Herramienta>(`${MUTATE_ENDPOINT}/${id}`, data)
  },

  delete: async (id: number) => {
    return del(`${MUTATE_ENDPOINT}/${id}`)
  }
}