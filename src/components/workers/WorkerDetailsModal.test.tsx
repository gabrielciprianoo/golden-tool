import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WorkerDetailsModal } from './WorkerDetailsModal'
import type { Worker } from '../../types/worker'

const mockWorker: Worker = {
  id: '1',
  worker_code: 'TRB001',
  name: 'Juan',
  lastname: 'Pérez',
  area: 'montaje/desmontaje',
  createdAt: '2024-01-15',
}

vi.mock('../../hooks/useAssignments', () => ({
  useAssignmentsByWorker: vi.fn(() => ({ data: [], isLoading: false })),
}))

vi.mock('../../hooks/useAvailableTools', () => ({
  useAvailableTools: vi.fn(() => ({ tools: [], isLoading: false })),
}))

vi.mock('../../hooks/useRequests', () => ({
  useRequestsByWorker: vi.fn(() => ({ data: [], isLoading: false })),
  useUpdateRequest: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useDeleteRequest: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
}))

vi.mock('../../stores/toastStore', () => ({
  useToastStore: vi.fn(() => ({ addToast: vi.fn() })),
}))

describe('WorkerDetailsModal', () => {
  it('debe renderizar correctamente', () => {
    render(<WorkerDetailsModal isOpen={true} onClose={vi.fn()} worker={mockWorker} />)
    expect(document.body).toBeInTheDocument()
  })
})