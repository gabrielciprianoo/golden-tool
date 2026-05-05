import { useState, useMemo, useEffect } from 'react'
import { Modal } from '../organisms'
import { Button } from '../atoms'
import { useAvailableTools } from '../../hooks/useAvailableTools'
import { useToastStore } from '../../stores/toastStore'
import { assignmentService } from '../../services/assignmentService'
import { TOOL_STATES, type ToolState, type Worker } from '../../types/worker'
import { IconPlus, IconMinus, IconTool, IconPackage } from '../atoms/Icons'

interface AssignToolModalProps {
  isOpen: boolean
  onClose: () => void
  worker: Worker
}

interface ToolSelection {
  id: number
  name: string
  category: string
  price: number
  supplier: string
  unassignedQuantity: number
  quantity: number
  state: ToolState
}

export const AssignToolModal = ({ isOpen, onClose, worker }: AssignToolModalProps) => {
  const { tools, isLoading, refetch } = useAvailableTools()
  const { addToast } = useToastStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const availableTools = useMemo((): ToolSelection[] => {
    return tools.map((t) => ({
      id: Number(t.id),
      name: t.name,
      category: t.category,
      price: t.price,
      supplier: t.supplier,
      unassignedQuantity: t.unassignedQuantity,
      quantity: 0,
      state: 'nuevo' as ToolState,
    }))
  }, [tools])

  const [toolList, setToolList] = useState<ToolSelection[]>(availableTools)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    setToolList(availableTools)
  }, [availableTools, isOpen])

  const filteredTools = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return toolList.filter((t) => t.name.toLowerCase().includes(term))
  }, [toolList, searchTerm])

  const selectedTools = useMemo(() => toolList.filter((t) => t.quantity > 0), [toolList])
  const selectedCount = useMemo(() => selectedTools.reduce((acc, t) => acc + t.quantity, 0), [selectedTools])

  const handleQuantityChange = (id: number, quantity: number) => {
    setToolList((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const qty = Math.max(0, Math.min(quantity, t.unassignedQuantity))
          return { ...t, quantity: qty }
        }
        return t
      })
    )
  }

  const incrementQuantity = (tool: ToolSelection) => {
    if (tool.quantity < tool.unassignedQuantity) {
      handleQuantityChange(tool.id, tool.quantity + 1)
    }
  }

  const decrementQuantity = (tool: ToolSelection) => {
    if (tool.quantity > 0) {
      handleQuantityChange(tool.id, tool.quantity - 1)
    }
  }

  const handleStateChange = (id: number, state: ToolState) => {
    setToolList((prev) =>
      prev.map((t) => (t.id === id ? { ...t, state } : t))
    )
  }

  const handleSelectAll = () => {
    const allSelected = toolList.every((t) => t.quantity === t.unassignedQuantity)
    setToolList((prev) =>
      prev.map((t) => ({
        ...t,
        quantity: allSelected ? 0 : t.unassignedQuantity,
      }))
    )
  }

  const handleSubmit = async () => {
    const toolsToAssign = toolList.filter((t) => t.quantity > 0)
    if (toolsToAssign.length === 0) {
      addToast('Selecciona al menos una herramienta', 'error')
      return
    }

    setIsSubmitting(true)
    try {
      for (const tool of toolsToAssign) {
        await assignmentService.create({
          worker_id: Number(worker.id),
          tool_id: tool.id,
          assigned_quantity: tool.quantity,
          state: tool.state,
          date: new Date().toISOString().split('T')[0],
        })
      }
      addToast(`Se asignaron ${selectedCount} herramienta(s) correctamente`, 'success')
      refetch()
      onClose()
      setToolList(availableTools)
    } catch {
      addToast('Error al asignar herramientas', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const categoryLabel = (cat: string) => {
    return cat === 'normal' ? 'Normal' : 'Refacción'
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Asignar Herramientas"
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting} disabled={selectedCount === 0}>
            Asignar ({selectedCount})
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <IconTool className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text)]" />
            <input
              type="text"
              placeholder="Buscar herramienta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--text-h)] placeholder:text-[var(--text)] focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500/20 transition-all"
            />
          </div>
          <button
            onClick={handleSelectAll}
            className="text-sm font-medium text-[var(--accent)] hover:underline whitespace-nowrap"
          >
            {toolList.every((t) => t.quantity === t.unassignedQuantity) ? 'Deseleccionar todo' : 'Seleccionar todo'}
          </button>
        </div>

        {selectedCount > 0 && (
          <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <IconPackage className="w-4 h-4 text-primary-600" />
              <span className="font-medium text-primary-700 dark:text-primary-300">Resumen de asignación</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedTools.map((tool) => (
                <span
                  key={tool.id}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-300 text-sm rounded-md"
                >
                  <span className="font-medium">{tool.name}</span>
                  <span className="text-primary-500">x{tool.quantity}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8 text-[var(--text)]">Cargando herramientas...</div>
        ) : filteredTools.length === 0 ? (
          <div className="text-center py-8 text-[var(--text)]">
            {searchTerm ? 'No se encontraron herramientas' : 'No hay herramientas en el inventario'}
          </div>
        ) : (
          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {filteredTools.map((tool) => {
              const isDisabled = tool.unassignedQuantity === 0
              const isSelected = tool.quantity > 0

              return (
                <div
                  key={tool.id}
                  className={`p-4 rounded-xl border transition-all duration-200 ${
                    isDisabled
                      ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10 opacity-60'
                      : isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-sm'
                      : 'border-[var(--border)] hover:border-[var(--accent)] hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => incrementQuantity(tool)}
                          disabled={isDisabled}
                          className={`p-1 rounded-lg transition-colors ${
                            isDisabled
                              ? 'cursor-not-allowed text-gray-400'
                              : 'text-[var(--accent)] hover:bg-[var(--accent)]/10'
                          }`}
                        >
                          <IconPlus className="w-4 h-4" />
                        </button>
                        <span className={`text-lg font-semibold min-w-[2rem] text-center ${
                          isDisabled ? 'text-red-500' : isSelected ? 'text-primary-600' : 'text-[var(--text-h)]'
                        }`}>
                          {tool.quantity}
                        </span>
                        <button
                          onClick={() => decrementQuantity(tool)}
                          disabled={isDisabled || tool.quantity === 0}
                          className={`p-1 rounded-lg transition-colors ${
                            isDisabled || tool.quantity === 0
                              ? 'cursor-not-allowed text-gray-400'
                              : 'text-[var(--accent)] hover:bg-[var(--accent)]/10'
                          }`}
                        >
                          <IconMinus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-[var(--text-h)] truncate">{tool.name}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[var(--text)]">
                          <span className="px-2 py-0.5 bg-[var(--accent)]/10 text-[var(--accent)] rounded text-xs font-medium">
                            {categoryLabel(tool.category)}
                          </span>
                          <span>${tool.price.toFixed(2)}</span>
                          <span className={`font-medium ${isDisabled ? 'text-red-500' : 'text-emerald-600'}`}>
                            {isDisabled ? '0 disponibles' : `${tool.unassignedQuantity} disponible(s)`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isSelected && !isDisabled && (
                      <div className="flex items-center gap-2 shrink-0">
                        <label className="text-sm text-[var(--text)] whitespace-nowrap">Estado:</label>
                        <select
                          value={tool.state}
                          onChange={(e) => handleStateChange(tool.id, e.target.value as ToolState)}
                          className="px-3 py-1.5 text-sm rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--text-h)] focus:outline-none focus:ring-2 focus:border-primary-500 cursor-pointer"
                        >
                          {TOOL_STATES.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        
      </div>
    </Modal>
  )
}
