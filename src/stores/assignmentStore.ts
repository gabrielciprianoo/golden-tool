import { create } from 'zustand'
import { type ToolState } from '../types/worker'

export interface ToolSelection {
  id: number
  name: string
  category: string
  price: number
  supplier: string
  unassignedQuantity: number
  quantity: number
  state: ToolState
}

interface AssignmentState {
  toolList: ToolSelection[]
  removeQty: Record<number, number>
  setToolList: (tools: ToolSelection[]) => void
  increaseQuantity: (id: number) => void
  decreaseQuantity: (id: number) => void
  updateToolState: (id: number, state: ToolState) => void
  setRemoveQty: (assignmentId: number, qty: number) => void
  reset: () => void
  getSelectedTools: () => ToolSelection[]
  getSelectedCount: () => number
  getTotalItems: () => number
}

export const useAssignmentStore = create<AssignmentState>((set, get) => ({
  toolList: [],
  removeQty: {},

  setToolList: (tools) => set({ toolList: tools }),

  increaseQuantity: (id) => {
    set((state) => ({
      toolList: state.toolList.map((t) =>
        t.id === id && t.quantity < t.unassignedQuantity
          ? { ...t, quantity: t.quantity + 1 }
          : t
      ),
    }))
  },

  decreaseQuantity: (id) => {
    set((state) => ({
      toolList: state.toolList.map((t) =>
        t.id === id && t.quantity > 0
          ? { ...t, quantity: t.quantity - 1 }
          : t
      ),
    }))
  },

  updateToolState: (id, newState) => {
    set((prev) => ({
      toolList: prev.toolList.map((t) =>
        t.id === id ? { ...t, state: newState } : t
      ),
    }))
  },

  setRemoveQty: (assignmentId, qty) => {
    set((state) => ({
      removeQty: { ...state.removeQty, [assignmentId]: qty },
    }))
  },

  reset: () => set({ toolList: [], removeQty: {} }),

  getSelectedTools: () => {
    return get().toolList.filter((t) => t.quantity > 0)
  },

  getSelectedCount: () => {
    return get().toolList.filter((t) => t.quantity > 0).length
  },

  getTotalItems: () => {
    return get()
      .toolList.filter((t) => t.quantity > 0)
      .reduce((acc, t) => acc + t.quantity, 0)
  },
}))

export default useAssignmentStore