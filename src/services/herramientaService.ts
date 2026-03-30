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

const ENDPOINT = '/herramientas'

export const herramientaService = {
  getAll: async () => {
    return get<Herramienta[]>(ENDPOINT)
  },

  create: async (data: Herramienta) => {
    return post<Herramienta>(ENDPOINT, data)
  },

  update: async (id: number, data: Herramienta) => {
    return put<Herramienta>(`${ENDPOINT}/${id}`, data)
  },

  delete: async (id: number) => {
    return del(`${ENDPOINT}/${id}`)
  }
}