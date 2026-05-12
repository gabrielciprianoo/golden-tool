import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ToolTable } from './ToolTable'
import type { Tool, ToolCategory, ToolStatus } from '../../types/inventory'

const mockTools: Tool[] = [
  { id: '1', name: 'Taladro Bosch', category: 'normal' as ToolCategory, price: 1500, supplier: 'Proveedor A', entryDate: '2024-01-15', quantity: 5, unassignedQuantity: 3, status: 'active' as ToolStatus },
  { id: '2', name: 'Destornillador', category: 'refaccion' as ToolCategory, price: 150, supplier: 'Proveedor B', entryDate: '2024-02-20', quantity: 20, unassignedQuantity: 15, status: 'inactive' as ToolStatus },
  { id: '3', name: 'Sierra Circular', category: 'normal' as ToolCategory, price: 2500, supplier: 'Proveedor A', entryDate: '2024-03-10', quantity: 2, unassignedQuantity: 0, status: 'active' as ToolStatus },
]

const defaultProps = {
  tools: mockTools,
  isLoading: false,
  search: '',
  supplier: '',
  category: '' as ToolCategory | '',
  status: '' as ToolStatus | '',
  totalCount: 3,
  onSearchChange: vi.fn(),
  onSupplierChange: vi.fn(),
  onCategoryChange: vi.fn(),
  onStatusChange: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onCreateNew: vi.fn(),
}

describe('ToolTable', () => {
  describe('Renderizado básico', () => {
    it('debe renderizar el título', () => {
      render(<ToolTable {...defaultProps} />)
      expect(screen.getByText('Inventario de Herramientas')).toBeInTheDocument()
    })

    it('debe mostrar la cantidad de herramientas', () => {
      render(<ToolTable {...defaultProps} />)
      expect(screen.getByText(/3 herramientas/)).toBeInTheDocument()
    })

    it('debe mostrar las herramientas en la tabla', () => {
      render(<ToolTable {...defaultProps} />)
      expect(screen.getByText('Taladro Bosch')).toBeInTheDocument()
      expect(screen.getByText('Destornillador')).toBeInTheDocument()
      expect(screen.getByText('Sierra Circular')).toBeInTheDocument()
    })

    it('debe mostrar spinner de carga cuando isLoading es true', () => {
      render(<ToolTable {...defaultProps} isLoading={true} />)
      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('Filtros', () => {
    it('debe tener input de búsqueda', () => {
      render(<ToolTable {...defaultProps} />)
      expect(screen.getByPlaceholderText('Buscar por nombre...')).toBeInTheDocument()
    })

    it('debe tener select de categoría', () => {
      render(<ToolTable {...defaultProps} />)
      expect(screen.getByText('Todas las categorías')).toBeInTheDocument()
    })

    it('debe tener select de garantía', () => {
      render(<ToolTable {...defaultProps} />)
      expect(screen.getByText('Todas las garantías')).toBeInTheDocument()
    })
  })

  describe('Botones de acción', () => {
    it('debe tener botón de nueva herramienta', () => {
      render(<ToolTable {...defaultProps} />)
      expect(screen.getByText('Nueva herramienta')).toBeInTheDocument()
    })

    it('debe llamar onCreateNew al hacer click en el botón', () => {
      const onCreateNew = vi.fn()
      render(<ToolTable {...defaultProps} onCreateNew={onCreateNew} />)
      screen.getByText('Nueva herramienta').click()
      expect(onCreateNew).toHaveBeenCalled()
    })
  })

  describe('Tabla', () => {
    it('debe mostrar las columnas de la tabla', () => {
      render(<ToolTable {...defaultProps} />)
      expect(screen.getByText('Herramienta')).toBeInTheDocument()
      expect(screen.getByText('Categoría')).toBeInTheDocument()
      expect(screen.getByText('Proveedor')).toBeInTheDocument()
    })
  })

  describe('Estado vacío', () => {
    it('debe mostrar mensaje de vacío cuando no hay tools', () => {
      render(<ToolTable {...defaultProps} tools={[]} totalCount={0} />)
      expect(screen.getByText('No hay herramientas registradas')).toBeInTheDocument()
    })
  })
})