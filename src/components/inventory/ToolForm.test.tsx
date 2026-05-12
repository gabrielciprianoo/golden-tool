import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ToolForm } from './ToolForm'
import type { Tool, ToolCategory, ToolStatus } from '../../types/inventory'

const mockTool: Tool = {
  id: '1',
  name: 'Taladro Bosch',
  category: 'normal' as ToolCategory,
  price: 1500,
  supplier: 'Proveedor A',
  entryDate: '2024-01-15',
  quantity: 5,
  unassignedQuantity: 3,
  status: 'active' as ToolStatus,
}

describe('ToolForm', () => {
  describe('rendering', () => {
    it('renders empty form when tool is null', () => {
      const onSubmit = vi.fn()
      const onClose = vi.fn()

      render(<ToolForm tool={null} onSubmit={onSubmit} isLoading={false} onClose={onClose} />)

      expect(screen.getByLabelText('Nombre')).toBeInTheDocument()
      expect(screen.getByLabelText('Categoría')).toBeInTheDocument()
      expect(screen.getByLabelText('Precio')).toBeInTheDocument()
      expect(screen.getByLabelText('Proveedor')).toBeInTheDocument()
      expect(screen.getByLabelText('Cantidad total')).toBeInTheDocument()
      expect(screen.getByLabelText('Garantía')).toBeInTheDocument()
    })

    it('renders with tool data when provided', () => {
      const onSubmit = vi.fn()
      const onClose = vi.fn()

      render(<ToolForm tool={mockTool} onSubmit={onSubmit} isLoading={false} onClose={onClose} />)

      expect((screen.getByLabelText('Nombre') as HTMLInputElement).value).toBe('Taladro Bosch')
      expect((screen.getByLabelText('Precio') as HTMLInputElement).value).toBe('1500')
      expect((screen.getByLabelText('Cantidad total') as HTMLInputElement).value).toBe('5')
    })

    it('shows "Crear" button when tool is null', () => {
      const onSubmit = vi.fn()
      const onClose = vi.fn()

      render(<ToolForm tool={null} onSubmit={onSubmit} isLoading={false} onClose={onClose} />)

      expect(screen.getByText('Crear')).toBeInTheDocument()
    })

    it('shows "Actualizar" button when tool is provided', () => {
      const onSubmit = vi.fn()
      const onClose = vi.fn()

      render(<ToolForm tool={mockTool} onSubmit={onSubmit} isLoading={false} onClose={onClose} />)

      expect(screen.getByText('Actualizar')).toBeInTheDocument()
    })

    it('shows loading state on button', () => {
      const onSubmit = vi.fn()
      const onClose = vi.fn()

      render(<ToolForm tool={null} onSubmit={onSubmit} isLoading={true} onClose={onClose} />)

      const buttons = screen.getAllByRole('button')
      const submitButton = buttons.find(btn => btn.type === 'submit')
      expect(submitButton).toBeDisabled()
    })
  })

  describe('default values', () => {
    it('has default category as "normal"', () => {
      const onSubmit = vi.fn()
      const onClose = vi.fn()

      render(<ToolForm tool={null} onSubmit={onSubmit} isLoading={false} onClose={onClose} />)

      expect((screen.getByLabelText('Categoría') as HTMLSelectElement).value).toBe('normal')
    })

    it('has default status as "active"', () => {
      const onSubmit = vi.fn()
      const onClose = vi.fn()

      render(<ToolForm tool={null} onSubmit={onSubmit} isLoading={false} onClose={onClose} />)

      expect((screen.getByLabelText('Garantía') as HTMLSelectElement).value).toBe('active')
    })

    it('has default price as 0', () => {
      const onSubmit = vi.fn()
      const onClose = vi.fn()

      render(<ToolForm tool={null} onSubmit={onSubmit} isLoading={false} onClose={onClose} />)

      expect((screen.getByLabelText('Precio') as HTMLInputElement).value).toBe('0')
    })

    it('has default quantity as 0', () => {
      const onSubmit = vi.fn()
      const onClose = vi.fn()

      render(<ToolForm tool={null} onSubmit={onSubmit} isLoading={false} onClose={onClose} />)

      expect((screen.getByLabelText('Cantidad total') as HTMLInputElement).value).toBe('0')
    })
  })

  describe('form submission', () => {
    it('calls onSubmit with form data', async () => {
      const onSubmit = vi.fn()
      const onClose = vi.fn()

      render(<ToolForm tool={null} onSubmit={onSubmit} isLoading={false} onClose={onClose} />)

      fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Nueva Herramienta' } })
      fireEvent.change(screen.getByLabelText('Precio'), { target: { value: '100' } })
      fireEvent.change(screen.getByLabelText('Cantidad total'), { target: { value: '10' } })

      fireEvent.click(screen.getByRole('button', { name: /crear/i }))

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Nueva Herramienta',
            price: 100,
            quantity: 10,
          })
        )
      })
    })

    it('converts price to number', async () => {
      const onSubmit = vi.fn()
      const onClose = vi.fn()

      render(<ToolForm tool={null} onSubmit={onSubmit} isLoading={false} onClose={onClose} />)

      fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Test' } })
      fireEvent.change(screen.getByLabelText('Precio'), { target: { value: '123.45' } })

      fireEvent.click(screen.getByRole('button', { name: /crear/i }))

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            price: 123.45,
          })
        )
      })
    })

    it('handles empty supplier', async () => {
      const onSubmit = vi.fn()
      const onClose = vi.fn()

      render(<ToolForm tool={null} onSubmit={onSubmit} isLoading={false} onClose={onClose} />)

      fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Test' } })

      fireEvent.click(screen.getByRole('button', { name: /crear/i }))

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            supplier: '',
          })
        )
      })
    })
  })

  describe('validation', () => {
    it('shows error when name is empty', async () => {
      const onSubmit = vi.fn()
      const onClose = vi.fn()

      render(<ToolForm tool={null} onSubmit={onSubmit} isLoading={false} onClose={onClose} />)

      fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: '' } })
      fireEvent.click(screen.getByRole('button', { name: /crear/i }))

      await waitFor(() => {
        expect(screen.getByText('El nombre es requerido')).toBeInTheDocument()
      })
    })

    it('shows error when category is empty', async () => {
      const onSubmit = vi.fn()
      const onClose = vi.fn()

      render(<ToolForm tool={null} onSubmit={onSubmit} isLoading={false} onClose={onClose} />)

      fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Test' } })
      fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: '' } })
      fireEvent.click(screen.getByRole('button', { name: /crear/i }))

      await waitFor(() => {
        expect(screen.getByText('La categoría es requerida')).toBeInTheDocument()
      })
    })

    it('does not call onSubmit when validation fails', () => {
      const onSubmit = vi.fn()
      const onClose = vi.fn()

      render(<ToolForm tool={null} onSubmit={onSubmit} isLoading={false} onClose={onClose} />)

      fireEvent.click(screen.getByRole('button', { name: /crear/i }))

      expect(onSubmit).not.toHaveBeenCalled()
    })
  })

  describe('cancel button', () => {
    it('calls onClose when cancel is clicked', () => {
      const onSubmit = vi.fn()
      const onClose = vi.fn()

      render(<ToolForm tool={null} onSubmit={onSubmit} isLoading={false} onClose={onClose} />)

      fireEvent.click(screen.getByText('Cancelar'))

      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('reset behavior', () => {
    it('resets form when tool changes from null to tool', () => {
      const onSubmit = vi.fn()
      const onClose = vi.fn()

      const { rerender } = render(
        <ToolForm tool={null} onSubmit={onSubmit} isLoading={false} onClose={onClose} />
      )

      fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Test Input' } })

      rerender(<ToolForm tool={mockTool} onSubmit={onSubmit} isLoading={false} onClose={onClose} />)

      expect((screen.getByLabelText('Nombre') as HTMLInputElement).value).toBe('Taladro Bosch')
    })

    it('resets form when tool changes from tool to null', () => {
      const onSubmit = vi.fn()
      const onClose = vi.fn()

      const { rerender } = render(
        <ToolForm tool={mockTool} onSubmit={onSubmit} isLoading={false} onClose={onClose} />
      )

      expect((screen.getByLabelText('Nombre') as HTMLInputElement).value).toBe('Taladro Bosch')

      rerender(<ToolForm tool={null} onSubmit={onSubmit} isLoading={false} onClose={onClose} />)

      expect((screen.getByLabelText('Nombre') as HTMLInputElement).value).toBe('')
      expect((screen.getByLabelText('Precio') as HTMLInputElement).value).toBe('0')
    })
  })
})