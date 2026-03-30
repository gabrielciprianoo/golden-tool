import { useState, useEffect, useMemo, useCallback } from 'react'
import type { Tool, ToolInput, ToolCategory, ToolStatus } from '../types/inventory'
import { herramientaService } from '../services/herramientaService'

interface InventoryFilters {
  search: string
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
    category: '',
    status: '',
  })

  const fetchTools = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await herramientaService.getAll()
      if ('success' in res && !res.success) {
        console.error('Error fetching tools:', 'error' in res ? res.error : 'Unknown error')
        setTools([])
        return
      }

      const responseData = 'data' in res ? res.data : []
      if (!Array.isArray(responseData)) {
        setTools([])
        return
      }

      const mapped: Tool[] = responseData.map((item) => ({
        id: String(item.id),
        name: item.nombre,
        category: (item.categoria || 'normal') as ToolCategory,
        price: Number(item.precio) || 0,
        supplier: item.proveedor || '',
        quantity: Number(item.cantidad) || 0,
        unassignedQuantity: Number(item.cantidad_no_asignada) || 0,
        entryDate: item.fecha_ingreso || '',
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
      const matchesCategory = filters.category === '' || tool.category === filters.category
      const matchesStatus = filters.status === '' || tool.status === filters.status

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [tools, filters])

  const createTool = useCallback(async (data: ToolInput): Promise<boolean> => {
    setIsSubmitting(true)
    try {
      const payload = {
        nombre: data.name,
        categoria: data.category,
        precio: data.price,
        proveedor: data.supplier || '',
        fecha_ingreso: new Date().toISOString().split('T')[0],
        cantidad: data.quantity,
        cantidad_no_asignada: data.unassignedQuantity,
      }

      const res = await herramientaService.create(payload)

      if ('success' in res && res.success && 'data' in res && res.data) {
        const responseData = res.data as unknown as { data?: Record<string, unknown> }
        const created = responseData.data
        if (!created) return false
        
        const newTool: Tool = {
          id: String(created.id || Date.now()),
          name: String(created.nombre || ''),
          category: (String(created.categoria) || 'normal') as ToolCategory,
          price: Number(created.precio) || 0,
          supplier: String(created.proveedor || ''),
          quantity: Number(created.cantidad) || 0,
          unassignedQuantity: Number(created.cantidad_no_asignada) || 0,
          entryDate: String(created.fecha_ingreso || ''),
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
        nombre: data.name,
        categoria: data.category,
        precio: data.price,
        proveedor: data.supplier || '',
        fecha_ingreso: new Date().toISOString().split('T')[0],
        cantidad: data.quantity,
        cantidad_no_asignada: data.unassignedQuantity,
      }

      await herramientaService.update(Number(id), payload)

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
      await herramientaService.delete(Number(id))
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
