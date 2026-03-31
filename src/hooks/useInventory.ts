import { useState, useEffect, useMemo, useCallback } from 'react'
import type { Tool, ToolInput, ToolCategory, ToolStatus } from '../types/inventory'
import { toolService } from '../services/toolService'

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
  fetchTools: () => Promise<void>
}

export const useInventory = (): UseInventoryReturn => {
  const [tools, setTools] = useState<Tool[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filters, setFilters] = useState<InventoryFilters>({
    search: '',
    supplier: '',
    category: '',
    status: '',
  })

  const fetchTools = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await toolService.getAll()
      if ('success' in res && !res.success) {
        console.error('Error fetching tools:', 'error' in res ? res.error : 'Unknown error')
        setTools([])
        return
      }

      const responseData = 'data' in res ? (res.data as unknown as Record<string, unknown>[]) : []
      if (!Array.isArray(responseData)) {
        setTools([])
        return
      }

      const mapped: Tool[] = responseData.map((item: Record<string, unknown>) => ({
        id: String(item.id),
        name: String(item.name || ''),
        category: (String(item.category) || 'normal') as ToolCategory,
        price: Number(item.price) || 0,
        supplier: String(item.supplier || ''),
        quantity: Number(item.quantity) || 0,
        unassignedQuantity: Number(item.unassigned_quantity) || 0,
        entryDate: String(item.entry_date || ''),
        status: 'active' as ToolStatus,
      }))

      setTools(mapped)
    } catch (error) {
      console.error(error)
      setTools([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTools()
  }, [fetchTools])

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

  const createTool = useCallback(async (data: ToolInput): Promise<boolean> => {
    setIsSubmitting(true)
    try {
      const payload = {
        name: data.name,
        category: data.category,
        price: data.price,
        supplier: data.supplier || '',
        entry_date: new Date().toISOString().split('T')[0],
        quantity: data.quantity,
        unassigned_quantity: data.unassignedQuantity,
      }

      const res = await toolService.create(payload)

      if ('success' in res && res.success && 'data' in res && res.data) {
        const responseData = res.data as unknown as { data?: Record<string, unknown> }
        const created = responseData.data
        if (!created) return false
        
        const newTool: Tool = {
          id: String(created.id || Date.now()),
          name: String(created.name || ''),
          category: (String(created.category) || 'normal') as ToolCategory,
          price: Number(created.price) || 0,
          supplier: String(created.supplier || ''),
          quantity: Number(created.quantity) || 0,
          unassignedQuantity: Number(created.unassigned_quantity) || 0,
          entryDate: String(created.entry_date || ''),
          status: 'active' as ToolStatus,
        }
        setTools(prev => [...prev, newTool])
        return true
      }
      return false
    } catch (error) {
      console.error(error)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const updateTool = useCallback(async (id: string, data: ToolInput): Promise<boolean> => {
    setIsSubmitting(true)
    try {
      const payload = {
        name: data.name,
        category: data.category,
        price: data.price,
        supplier: data.supplier || '',
        entry_date: new Date().toISOString().split('T')[0],
        quantity: data.quantity,
        unassigned_quantity: data.unassignedQuantity,
      }

      await toolService.update(Number(id), payload)

      setTools(prev =>
        prev.map(t =>
          t.id === id ? { ...t, ...data } : t
        )
      )
      return true
    } catch (error) {
      console.error(error)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const deleteTool = useCallback(async (id: string): Promise<boolean> => {
    setIsSubmitting(true)
    try {
      await toolService.delete(Number(id))
      setTools(prev => prev.filter(t => t.id !== id))
      return true
    } catch (error) {
      console.error(error)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  return {
    tools,
    isLoading,
    isSubmitting,
    filters,
    filteredTools,
    setFilters: (newFilters) => setFilters(prev => ({ ...prev, ...newFilters })),
    createTool,
    updateTool,
    deleteTool,
    fetchTools,
  }
}
