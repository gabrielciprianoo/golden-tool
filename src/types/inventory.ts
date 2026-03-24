export interface Part {
  id: string
  code: string
  name: string
  description: string
  category: PartCategory
  brand: string
  model: string
  stock: number
  minStock: number
  maxStock: number
  costPrice: number
  sellPrice: number
  supplierId: string
  supplierName: string
  location: string
  createdAt: string
  updatedAt: string
}

export type PartCategory =
  | 'transmission'
  | 'engine'
  | 'brake'
  | 'suspension'
  | 'electrical'
  | 'body'
  | 'fluids'
  | 'other'

export interface PartInput {
  code: string
  name: string
  description: string
  category: PartCategory
  brand: string
  model: string
  stock: number
  minStock: number
  maxStock: number
  costPrice: number
  sellPrice: number
  supplierId: string
  location: string
}

export interface Supplier {
  id: string
  name: string
  contact: string
  email: string
  phone: string
  address: string
  rfc: string
  notes: string
  createdAt: string
  updatedAt: string
}

export interface SupplierInput {
  name: string
  contact: string
  email: string
  phone: string
  address: string
  rfc: string
  notes?: string
}

export interface StockMovement {
  id: string
  partId: string
  partCode: string
  partName: string
  type: 'in' | 'out' | 'adjustment'
  quantity: number
  previousStock: number
  newStock: number
  reason: string
  reference: string
  userId: string
  userName: string
  createdAt: string
}

export interface StockMovementInput {
  partId: string
  type: 'in' | 'out' | 'adjustment'
  quantity: number
  reason: string
  reference?: string
}

export interface InventoryStats {
  totalParts: number
  totalValue: number
  lowStockCount: number
  outOfStockCount: number
  categoryBreakdown: Record<PartCategory, number>
}
