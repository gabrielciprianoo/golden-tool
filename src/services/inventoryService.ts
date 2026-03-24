import { get, post, put, del } from './apiClient'
import type { ApiResult, PaginatedResponse } from '../types/api'
import type {
  Part,
  PartInput,
  Supplier,
  SupplierInput,
  StockMovement,
  StockMovementInput,
  InventoryStats,
} from '../types/inventory'

const PARTS_ENDPOINT = '/parts'
const SUPPLIERS_ENDPOINT = '/suppliers'
const MOVEMENTS_ENDPOINT = '/stock-movements'
const STATS_ENDPOINT = '/inventory/stats'

export const inventoryService = {
  // Parts
  getParts: async (page = 1, limit = 20, search?: string): Promise<ApiResult<PaginatedResponse<Part>>> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (search) params.append('search', search)
    return get<PaginatedResponse<Part>>(`${PARTS_ENDPOINT}?${params}`)
  },

  getPart: async (id: string): Promise<ApiResult<Part>> => {
    return get<Part>(`${PARTS_ENDPOINT}/${id}`)
  },

  createPart: async (data: PartInput): Promise<ApiResult<Part>> => {
    return post<Part>(PARTS_ENDPOINT, data)
  },

  updatePart: async (id: string, data: Partial<PartInput>): Promise<ApiResult<Part>> => {
    return put<Part>(`${PARTS_ENDPOINT}/${id}`, data)
  },

  deletePart: async (id: string): Promise<ApiResult<void>> => {
    return del<void>(`${PARTS_ENDPOINT}/${id}`)
  },

  // Suppliers
  getSuppliers: async (page = 1, limit = 20, search?: string): Promise<ApiResult<PaginatedResponse<Supplier>>> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (search) params.append('search', search)
    return get<PaginatedResponse<Supplier>>(`${SUPPLIERS_ENDPOINT}?${params}`)
  },

  getSupplier: async (id: string): Promise<ApiResult<Supplier>> => {
    return get<Supplier>(`${SUPPLIERS_ENDPOINT}/${id}`)
  },

  createSupplier: async (data: SupplierInput): Promise<ApiResult<Supplier>> => {
    return post<Supplier>(SUPPLIERS_ENDPOINT, data)
  },

  updateSupplier: async (id: string, data: Partial<SupplierInput>): Promise<ApiResult<Supplier>> => {
    return put<Supplier>(`${SUPPLIERS_ENDPOINT}/${id}`, data)
  },

  deleteSupplier: async (id: string): Promise<ApiResult<void>> => {
    return del<void>(`${SUPPLIERS_ENDPOINT}/${id}`)
  },

  // Stock Movements
  getMovements: async (
    partId?: string,
    page = 1,
    limit = 50
  ): Promise<ApiResult<PaginatedResponse<StockMovement>>> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (partId) params.append('partId', partId)
    return get<PaginatedResponse<StockMovement>>(`${MOVEMENTS_ENDPOINT}?${params}`)
  },

  createMovement: async (data: StockMovementInput): Promise<ApiResult<StockMovement>> => {
    return post<StockMovement>(MOVEMENTS_ENDPOINT, data)
  },

  // Stats
  getStats: async (): Promise<ApiResult<InventoryStats>> => {
    return get<InventoryStats>(STATS_ENDPOINT)
  },
}
