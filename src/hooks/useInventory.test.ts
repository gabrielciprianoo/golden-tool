import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useInventory } from './useInventory'
import type { Tool, ToolCategory, ToolStatus } from '../types/inventory'

const mockTools: Tool[] = [
  {
    id: '1',
    name: 'Taladro Bosch',
    category: 'normal' as ToolCategory,
    price: 1500,
    supplier: 'Proveedor A',
    entryDate: '2024-01-15',
    quantity: 5,
    unassignedQuantity: 3,
    status: 'active' as ToolStatus,
  },
  {
    id: '2',
    name: 'Destornillador',
    category: 'refaccion' as ToolCategory,
    price: 150,
    supplier: 'Proveedor B',
    entryDate: '2024-02-20',
    quantity: 20,
    unassignedQuantity: 15,
    status: 'active' as ToolStatus,
  },
  {
    id: '3',
    name: 'Sierra Circular',
    category: 'normal' as ToolCategory,
    price: 2500,
    supplier: 'Proveedor A',
    entryDate: '2024-03-10',
    quantity: 2,
    unassignedQuantity: 0,
    status: 'inactive' as ToolStatus,
  },
  {
    id: '4',
    name: 'Martillo',
    category: 'normal' as ToolCategory,
    price: 200,
    supplier: '',
    entryDate: '2024-04-05',
    quantity: 10,
    unassignedQuantity: 8,
    status: 'active' as ToolStatus,
  },
]

vi.mock('./useTools', () => ({
  useTools: () => ({
    tools: mockTools,
    isLoading: false,
    refetch: vi.fn(),
    createTool: vi.fn().mockResolvedValue({}),
    updateTool: vi.fn().mockResolvedValue({}),
    deleteTool: vi.fn().mockResolvedValue({}),
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
  }),
}))

describe('useInventory', () => {
  describe('initial state', () => {
    it('returns all tools when no filters applied', () => {
      const { result } = renderHook(() => useInventory())
      expect(result.current.filteredTools).toHaveLength(4)
      expect(result.current.tools).toHaveLength(4)
    })

    it('has empty initial filters', () => {
      const { result } = renderHook(() => useInventory())
      expect(result.current.filters.search).toBe('')
      expect(result.current.filters.supplier).toBe('')
      expect(result.current.filters.category).toBe('')
      expect(result.current.filters.status).toBe('')
    })

    it('returns isLoading as false', () => {
      const { result } = renderHook(() => useInventory())
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('search filter', () => {
    it('filters tools by name (case insensitive)', () => {
      const { result } = renderHook(() => useInventory())
      
      act(() => {
        result.current.setFilters({ search: 'taladro' })
      })
      
      expect(result.current.filteredTools).toHaveLength(1)
      expect(result.current.filteredTools[0].name).toBe('Taladro Bosch')
    })

    it('filters by partial match', () => {
      const { result } = renderHook(() => useInventory())
      
      act(() => {
        result.current.setFilters({ search: 'sierra' })
      })
      
      expect(result.current.filteredTools).toHaveLength(1)
      expect(result.current.filteredTools[0].name).toBe('Sierra Circular')
    })

    it('returns all tools when search is empty', () => {
      const { result } = renderHook(() => useInventory())
      
      act(() => {
        result.current.setFilters({ search: 'algo' })
      })
      
      act(() => {
        result.current.setFilters({ search: '' })
      })
      
      expect(result.current.filteredTools).toHaveLength(4)
    })

    it('returns empty when no match', () => {
      const { result } = renderHook(() => useInventory())
      
      act(() => {
        result.current.setFilters({ search: 'xyznonexistent' })
      })
      
      expect(result.current.filteredTools).toHaveLength(0)
    })
  })

  describe('supplier filter', () => {
    it('filters by supplier name', () => {
      const { result } = renderHook(() => useInventory())
      
      act(() => {
        result.current.setFilters({ supplier: 'Proveedor A' })
      })
      
      expect(result.current.filteredTools).toHaveLength(2)
      expect(result.current.filteredTools.map(t => t.name)).toContain('Taladro Bosch')
      expect(result.current.filteredTools.map(t => t.name)).toContain('Sierra Circular')
    })

    it('filters by partial supplier match (case insensitive)', () => {
      const { result } = renderHook(() => useInventory())
      
      act(() => {
        result.current.setFilters({ supplier: 'proveedor b' })
      })
      
      expect(result.current.filteredTools).toHaveLength(1)
      expect(result.current.filteredTools[0].name).toBe('Destornillador')
    })

    it('returns all tools when supplier filter is empty', () => {
      const { result } = renderHook(() => useInventory())
      
      act(() => {
        result.current.setFilters({ supplier: '' })
      })
      
      expect(result.current.filteredTools).toHaveLength(4)
    })
  })

  describe('category filter', () => {
    it('filters by category "normal"', () => {
      const { result } = renderHook(() => useInventory())
      
      act(() => {
        result.current.setFilters({ category: 'normal' })
      })
      
      expect(result.current.filteredTools).toHaveLength(3)
      expect(result.current.filteredTools.every(t => t.category === 'normal')).toBe(true)
    })

    it('filters by category "refaccion"', () => {
      const { result } = renderHook(() => useInventory())
      
      act(() => {
        result.current.setFilters({ category: 'refaccion' })
      })
      
      expect(result.current.filteredTools).toHaveLength(1)
      expect(result.current.filteredTools[0].name).toBe('Destornillador')
    })

    it('returns all tools when category filter is empty', () => {
      const { result } = renderHook(() => useInventory())
      
      act(() => {
        result.current.setFilters({ category: '' })
      })
      
      expect(result.current.filteredTools).toHaveLength(4)
    })
  })

  describe('status filter', () => {
    it('filters by status "active"', () => {
      const { result } = renderHook(() => useInventory())
      
      act(() => {
        result.current.setFilters({ status: 'active' })
      })
      
      expect(result.current.filteredTools).toHaveLength(3)
      expect(result.current.filteredTools.every(t => t.status === 'active')).toBe(true)
    })

    it('filters by status "inactive"', () => {
      const { result } = renderHook(() => useInventory())
      
      act(() => {
        result.current.setFilters({ status: 'inactive' })
      })
      
      expect(result.current.filteredTools).toHaveLength(1)
      expect(result.current.filteredTools[0].name).toBe('Sierra Circular')
    })

    it('returns all tools when status filter is empty', () => {
      const { result } = renderHook(() => useInventory())
      
      act(() => {
        result.current.setFilters({ status: '' })
      })
      
      expect(result.current.filteredTools).toHaveLength(4)
    })
  })

  describe('combined filters', () => {
    it('filters by search + category', () => {
      const { result } = renderHook(() => useInventory())
      
      act(() => {
        result.current.setFilters({ search: 'taladro', category: 'normal' })
      })
      
      expect(result.current.filteredTools).toHaveLength(1)
      expect(result.current.filteredTools[0].name).toBe('Taladro Bosch')
    })

    it('filters by supplier + status', () => {
      const { result } = renderHook(() => useInventory())
      
      act(() => {
        result.current.setFilters({ supplier: 'Proveedor A', status: 'active' })
      })
      
      expect(result.current.filteredTools).toHaveLength(1)
      expect(result.current.filteredTools[0].name).toBe('Taladro Bosch')
    })

    it('filters by category + status + search', () => {
      const { result } = renderHook(() => useInventory())
      
      act(() => {
        result.current.setFilters({ category: 'normal', status: 'inactive', search: 'sierra' })
      })
      
      expect(result.current.filteredTools).toHaveLength(1)
      expect(result.current.filteredTools[0].name).toBe('Sierra Circular')
    })

    it('returns empty when filters dont match any tool', () => {
      const { result } = renderHook(() => useInventory())
      
      act(() => {
        result.current.setFilters({ category: 'refaccion', status: 'inactive' })
      })
      
      expect(result.current.filteredTools).toHaveLength(0)
    })
  })

  describe('setFilters', () => {
    it('updates single filter while keeping others', () => {
      const { result } = renderHook(() => useInventory())
      
      act(() => {
        result.current.setFilters({ category: 'normal' })
      })
      expect(result.current.filters.category).toBe('normal')
      
      act(() => {
        result.current.setFilters({ status: 'active' })
      })
      expect(result.current.filters.category).toBe('normal')
      expect(result.current.filters.status).toBe('active')
    })

    it('can clear filters with empty values', () => {
      const { result } = renderHook(() => useInventory())
      
      act(() => {
        result.current.setFilters({ search: 'taladro', category: 'normal' })
      })
      
      act(() => {
        result.current.setFilters({ search: '', category: '' })
      })
      
      expect(result.current.filteredTools).toHaveLength(4)
    })

    it('accepts partial filter object', () => {
      const { result } = renderHook(() => useInventory())
      
      act(() => {
        result.current.setFilters({ search: 'test' })
      })
      
      expect(result.current.filters.search).toBe('test')
      expect(result.current.filters.supplier).toBe('')
    })
  })

  describe('edge cases', () => {
    it('handles tool without supplier when filtering by supplier', () => {
      const { result } = renderHook(() => useInventory())
      
      act(() => {
        result.current.setFilters({ supplier: 'cualquiera' })
      })
      
      expect(result.current.filteredTools).toHaveLength(0)
    })

    it('search is case insensitive', () => {
      const { result } = renderHook(() => useInventory())
      
      act(() => {
        result.current.setFilters({ search: 'MARTILLO' })
      })
      
      expect(result.current.filteredTools).toHaveLength(1)
      expect(result.current.filteredTools[0].name).toBe('Martillo')
    })

    it('supplier filter is case insensitive', () => {
      const { result } = renderHook(() => useInventory())
      
      act(() => {
        result.current.setFilters({ supplier: 'PROVEEDOR A' })
      })
      
      expect(result.current.filteredTools).toHaveLength(2)
    })
  })
})