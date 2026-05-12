import { describe, it, expect, beforeEach } from 'vitest'
import { useAssignmentStore, type ToolSelection } from './assignmentStore'

const mockTools: ToolSelection[] = [
  { id: 1, name: 'Taladro', category: 'normal', price: 1500, supplier: 'A', unassignedQuantity: 5, quantity: 0, state: 'nuevo' },
  { id: 2, name: 'Destornillador', category: 'refaccion', price: 150, supplier: 'B', unassignedQuantity: 10, quantity: 0, state: 'nuevo' },
]

describe('useAssignmentStore', () => {
  beforeEach(() => {
    useAssignmentStore.getState().reset()
  })

  describe('Estado inicial', () => {
    it('debe tener toolList vacío', () => {
      expect(useAssignmentStore.getState().toolList).toEqual([])
    })

    it('debe tener removeQty vacío', () => {
      expect(useAssignmentStore.getState().removeQty).toEqual({})
    })
  })

  describe('setToolList', () => {
    it('debe establecer la lista de herramientas', () => {
      const { setToolList } = useAssignmentStore.getState()
      setToolList(mockTools)
      expect(useAssignmentStore.getState().toolList).toHaveLength(2)
    })
  })

  describe('increaseQuantity', () => {
    it('debe aumentar la cantidad de una herramienta', () => {
      const { setToolList, increaseQuantity } = useAssignmentStore.getState()
      setToolList(mockTools)
      increaseQuantity(1)
      const tool = useAssignmentStore.getState().toolList.find(t => t.id === 1)
      expect(tool?.quantity).toBe(1)
    })

    it('no debe aumentar más que unassignedQuantity', () => {
      const { setToolList, increaseQuantity } = useAssignmentStore.getState()
      setToolList(mockTools)
      increaseQuantity(1)
      increaseQuantity(1)
      increaseQuantity(1)
      increaseQuantity(1)
      increaseQuantity(1)
      increaseQuantity(1)
      const tool = useAssignmentStore.getState().toolList.find(t => t.id === 1)
      expect(tool?.quantity).toBe(5)
    })
  })

  describe('decreaseQuantity', () => {
    it('debe disminuir la cantidad', () => {
      const { setToolList, increaseQuantity, decreaseQuantity } = useAssignmentStore.getState()
      setToolList(mockTools)
      increaseQuantity(1)
      decreaseQuantity(1)
      const tool = useAssignmentStore.getState().toolList.find(t => t.id === 1)
      expect(tool?.quantity).toBe(0)
    })

    it('no debe diminuir por debajo de 0', () => {
      const { setToolList, decreaseQuantity } = useAssignmentStore.getState()
      setToolList(mockTools)
      decreaseQuantity(1)
      const tool = useAssignmentStore.getState().toolList.find(t => t.id === 1)
      expect(tool?.quantity).toBe(0)
    })
  })

  describe('updateToolState', () => {
    it('debe actualizar el estado de una herramienta', () => {
      const { setToolList, updateToolState } = useAssignmentStore.getState()
      setToolList(mockTools)
      updateToolState(1, 'en_buen_estado')
      const tool = useAssignmentStore.getState().toolList.find(t => t.id === 1)
      expect(tool?.state).toBe('en_buen_estado')
    })
  })

  describe('setRemoveQty', () => {
    it('debe establecer cantidad a remover', () => {
      const { setRemoveQty } = useAssignmentStore.getState()
      setRemoveQty(1, 3)
      expect(useAssignmentStore.getState().removeQty).toEqual({ 1: 3 })
    })
  })

  describe('getSelectedTools', () => {
    it('debe devolver herramientas con cantidad > 0', () => {
      const { setToolList, increaseQuantity, getSelectedTools } = useAssignmentStore.getState()
      setToolList(mockTools)
      increaseQuantity(1)
      increaseQuantity(2)
      const selected = getSelectedTools()
      expect(selected).toHaveLength(2)
    })
  })

  describe('getSelectedCount', () => {
    it('debe devolver el número de herramientas seleccionadas', () => {
      const { setToolList, increaseQuantity, getSelectedCount } = useAssignmentStore.getState()
      setToolList(mockTools)
      increaseQuantity(1)
      increaseQuantity(1)
      increaseQuantity(2)
      expect(getSelectedCount()).toBe(2)
    })
  })

  describe('getTotalItems', () => {
    it('debe devolver la suma total de cantidades', () => {
      const { setToolList, increaseQuantity, getTotalItems } = useAssignmentStore.getState()
      setToolList(mockTools)
      increaseQuantity(1)
      increaseQuantity(1)
      increaseQuantity(1)
      increaseQuantity(2)
      expect(getTotalItems()).toBe(4)
    })
  })

  describe('reset', () => {
    it('debe limpiar todo', () => {
      const { setToolList, increaseQuantity, setRemoveQty, reset } = useAssignmentStore.getState()
      setToolList(mockTools)
      increaseQuantity(1)
      setRemoveQty(1, 2)
      reset()
      expect(useAssignmentStore.getState().toolList).toEqual([])
      expect(useAssignmentStore.getState().removeQty).toEqual({})
    })
  })
})