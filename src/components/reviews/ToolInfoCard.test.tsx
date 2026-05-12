import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ToolInfoCard } from './ToolInfoCard'
import type { ReviewGroup } from '../../schemas/reviewSchema'

const mockGroup: ReviewGroup = {
  tool_id: 1,
  tool: {
    id: 1,
    name: 'Taladro Bosch',
    category: 'normal',
    price: 1500,
    supplier: 'Proveedor A',
    quantity: 5,
    unassigned_quantity: 3,
  },
  state: 'nuevo',
  asignations: [],
}

describe('ToolInfoCard', () => {
  it('debe renderizar el nombre de la herramienta', () => {
    render(<ToolInfoCard group={mockGroup} />)
    expect(screen.getByText('Taladro Bosch')).toBeInTheDocument()
  })

  it('debe renderizar el estado', () => {
    render(<ToolInfoCard group={mockGroup} />)
    expect(screen.getByText('Nuevo')).toBeInTheDocument()
  })
})