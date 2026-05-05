import { useMemo, useState } from 'react'
import type { Tool, ToolInput, ToolCategory, ToolStatus } from '../types/inventory'
import { useTools } from './useTools'

interface InventoryFilters {
  search: string
  supplier: string
  category: ToolCategory | ''
  status: ToolStatus | ''
}

interface UseInventoryReturn {
  tools: Tool[]
  isLoading: boolean
  isSubmitting: boolean
  filters: InventoryFilters
  filteredTools: Tool[]
  setFilters: (filters: Partial<InventoryFilters>) => void
  createTool: (data: ToolInput) => Promise<boolean>
  updateTool: (id: string, data: ToolInput) => Promise<boolean>
  deleteTool: (id: string) => Promise<boolean>
  refetch: () => void
}

export const useInventory = (): UseInventoryReturn => {
  const { tools, isLoading, refetch, createTool: create, updateTool: update, deleteTool: remove, isCreating, isUpdating, isDeleting } = useTools()
  
  const [filters, setFilters] = useState<InventoryFilters>({
    search: '',
    supplier: '',
    category: '',
    status: '',
  })

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(filters.search.toLowerCase())
      const matchesSupplier = filters.supplier === '' || 
        (tool.supplier && tool.supplier.toLowerCase().includes(filters.supplier.toLowerCase()))
      const matchesCategory = filters.category === '' || tool.category === filters.category
      const matchesStatus = filters.status === '' || tool.status === filters.status

      return matchesSearch && matchesSupplier && matchesCategory && matchesStatus
    })
  }, [tools, filters])

  const handleCreate = async (data: ToolInput): Promise<boolean> => {
    try {
      await create({
        name: data.name,
        category: data.category,
        price: data.price,
        supplier: data.supplier || '',
        entry_date: new Date().toISOString().split('T')[0],
        quantity: data.quantity,
        warranty: data.status === 'active' ? 'con garantia' : 'sin garantia',
      })
      return true
    } catch {
      return false
    }
  }

  const handleUpdate = async (id: string, data: ToolInput): Promise<boolean> => {
    try {
      await update({
        id: Number(id),
        data: {
          name: data.name,
          category: data.category,
          price: data.price,
          supplier: data.supplier || '',
          entry_date: new Date().toISOString().split('T')[0],
          quantity: data.quantity,
          warranty: data.status === 'active' ? 'con garantia' : 'sin garantia',
        },
      })
      return true
    } catch {
      return false
    }
  }

  const handleDelete = async (id: string): Promise<boolean> => {
    try {
      await remove(Number(id))
      return true
    } catch {
      return false
    }
  }

  return {
    tools,
    isLoading,
    isSubmitting: isCreating || isUpdating || isDeleting,
    filters,
    filteredTools,
    setFilters: (newFilters) => setFilters(prev => ({ ...prev, ...newFilters })),
    createTool: handleCreate,
    updateTool: handleUpdate,
    deleteTool: handleDelete,
    refetch,
  }
}