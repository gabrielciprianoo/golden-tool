import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ReviewWizard, toGroups } from './ReviewWizard'
import type { ReviewAsignation, ReviewTool, ToolState } from '../../schemas/reviewSchema'

const mockTool: ReviewTool = {
  id: 1,
  name: 'Taladro',
  category: 'normal',
  price: 1500,
  supplier: 'Proveedor A',
  quantity: 5,
  unassigned_quantity: 3,
}

const createAsignation = (id: number, toolId: number, state: ToolState): ReviewAsignation => ({
  id,
  tool_id: toolId,
  worker_id: 1,
  assigned_quantity: 1,
  state,
  date: '2024-01-15',
  tool: mockTool,
})

describe('ReviewWizard', () => {
  describe('toGroups function', () => {
    it('converts single asignation to group', () => {
      const asignations = [createAsignation(1, 1, 'nuevo')]
      const groups = toGroups(asignations)

      expect(groups).toHaveLength(1)
      expect(groups[0].tool_id).toBe(1)
      expect(groups[0].state).toBe('nuevo')
      expect(groups[0].asignations).toHaveLength(1)
    })

    it('converts multiple asignations to multiple groups', () => {
      const asignations = [
        createAsignation(1, 1, 'nuevo'),
        createAsignation(2, 2, 'buen estado'),
        createAsignation(3, 3, 'regular'),
      ]
      const groups = toGroups(asignations)

      expect(groups).toHaveLength(3)
      expect(groups[0].state).toBe('nuevo')
      expect(groups[1].state).toBe('buen estado')
      expect(groups[2].state).toBe('regular')
    })

    it('preserves tool info in group', () => {
      const asignations = [createAsignation(1, 1, 'nuevo')]
      const groups = toGroups(asignations)

      expect(groups[0].tool).toBeDefined()
      expect(groups[0].tool?.name).toBe('Taladro')
    })

    it('handles empty array', () => {
      const groups = toGroups([])
      expect(groups).toHaveLength(0)
    })
  })

  describe('component rendering', () => {
    it('returns null when asignations is empty', () => {
      const onComplete = vi.fn()
      const { container } = render(<ReviewWizard asignations={[]} onComplete={onComplete} />)
      expect(container.firstChild).toBeNull()
    })

    it('renders first tool info', () => {
      const asignations = [createAsignation(1, 1, 'nuevo')]
      const onComplete = vi.fn()

      render(<ReviewWizard asignations={asignations} onComplete={onComplete} />)
      
      expect(screen.getAllByText('Taladro')).toHaveLength(2)
    })
  })

  describe('wizard navigation', () => {
    it('shows WizardQuestion first', () => {
      const asignations = [createAsignation(1, 1, 'nuevo')]
      const onComplete = vi.fn()

      render(<ReviewWizard asignations={asignations} onComplete={onComplete} />)
      
      expect(screen.getByText(/¿El trabajador aún cuenta con esta herramienta/)).toBeInTheDocument()
    })

    it('advances to WizardState after selecting "still has"', () => {
      const asignations = [createAsignation(1, 1, 'nuevo')]
      const onComplete = vi.fn()

      render(<ReviewWizard asignations={asignations} onComplete={onComplete} />)
      
      const stillHasButton = screen.getByText('Sí, la tiene')
      fireEvent.click(stillHasButton)
      
      expect(screen.getByText(/¿En qué estado se encuentra/)).toBeInTheDocument()
    })

    it('completes wizard when selecting "lost"', () => {
      const asignations = [createAsignation(1, 1, 'nuevo')]
      const onComplete = vi.fn()

      render(<ReviewWizard asignations={asignations} onComplete={onComplete} />)
      
      const lostButton = screen.getByText('No, se perdió')
      fireEvent.click(lostButton)
      
      expect(onComplete).toHaveBeenCalledTimes(1)
      expect(onComplete).toHaveBeenCalledWith([
        expect.objectContaining({
          quantityPresent: 0,
          unitStates: [],
        }),
      ])
    })
  })

  describe('multi-tool flow', () => {
    it('navigates to second tool after completing first', () => {
      const asignations = [
        createAsignation(1, 1, 'nuevo'),
        createAsignation(2, 2, 'buen estado'),
      ]
      const onComplete = vi.fn()

      render(<ReviewWizard asignations={asignations} onComplete={onComplete} />)
      
      fireEvent.click(screen.getByText('No, se perdió'))
      
      expect(screen.getAllByText('Taladro')).toHaveLength(3)
    })

    it('calls onComplete after last tool', () => {
      const asignations = [
        createAsignation(1, 1, 'nuevo'),
        createAsignation(2, 2, 'buen estado'),
      ]
      const onComplete = vi.fn()

      render(<ReviewWizard asignations={asignations} onComplete={onComplete} />)
      
      fireEvent.click(screen.getByText('No, se perdió'))
      expect(onComplete).not.toHaveBeenCalled()
      
      fireEvent.click(screen.getByText('No, se perdió'))
      expect(onComplete).toHaveBeenCalledTimes(1)
    })
  })

  describe('state management', () => {
    it('resets selectedState when moving to next tool', () => {
      const asignations = [
        createAsignation(1, 1, 'nuevo'),
        createAsignation(2, 2, 'regular'),
      ]
      const onComplete = vi.fn()

      render(<ReviewWizard asignations={asignations} onComplete={onComplete} />)
      
      fireEvent.click(screen.getByText('Sí, la tiene'))
      
      fireEvent.click(screen.getByText('Confirmar estado'))
      
      expect(screen.getByText('Regular')).toBeInTheDocument()
    })
  })
})