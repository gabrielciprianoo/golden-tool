import { useState, useMemo } from 'react'
import { Modal } from '../organisms'
import { Button } from '../atoms'
import { useTools } from '../../hooks/useTools'
import { useToastStore } from '../../stores/toastStore'
import { assignmentService } from '../../services/assignmentService'
import { TOOL_STATES, type ToolState, type Worker } from '../../types/worker'

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
  selected: boolean
  state: ToolState
}

export const AssignToolModal = ({ isOpen, onClose, worker }: AssignToolModalProps) => {
  const { tools, isLoading, refetch } = useTools()
  const { addToast } = useToastStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const availableTools = useMemo(() => {
    return tools
      .filter((t) => t.unassignedQuantity > 0)
      .map((t) => ({
        id: Number(t.id),
        name: t.name,
        category: t.category,
        price: t.price,
        supplier: t.supplier,
        unassignedQuantity: t.unassignedQuantity,
        selected: false,
        state: 'nuevo' as ToolState,
      }))
  }, [tools])

  const [toolList, setToolList] = useState<ToolSelection[]>(availableTools)
  const [searchTerm, setSearchTerm] = useState('')

  useMemo(() => {
    setToolList(availableTools)
  }, [availableTools, isOpen])

  const filteredTools = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return toolList.filter((t) => t.name.toLowerCase().includes(term))
  }, [toolList, searchTerm])

  const selectedCount = toolList.filter((t) => t.selected).length

  const handleToggleTool = (id: number) => {
    setToolList((prev) =>
      prev.map((t) => (t.id === id ? { ...t, selected: !t.selected } : t))
    )
  }

  const handleStateChange = (id: number, state: ToolState) => {
    setToolList((prev) =>
      prev.map((t) => (t.id === id ? { ...t, state } : t))
    )
  }

  const handleSelectAll = () => {
    const allSelected = toolList.every((t) => t.selected)
    setToolList((prev) => prev.map((t) => ({ ...t, selected: !allSelected })))
  }

  const handleSubmit = async () => {
    const selectedTools = toolList.filter((t) => t.selected)
    if (selectedTools.length === 0) {
      addToast('Selecciona al menos una herramienta', 'error')
      return
    }

    setIsSubmitting(true)
    try {
      for (const tool of selectedTools) {
        await assignmentService.create({
          id_worker: worker.id,
          id_tool: tool.id,
          state: tool.state,
        })
      }
      addToast('Herramientas asignadas correctamente', 'success')
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
      title="Agregar Herramienta"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            Asignar ({selectedCount})
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <input
            type="text"
            placeholder="Buscar herramienta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-xs px-3 py-2 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--text-h)] placeholder:text-[var(--text)] focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500/20"
          />
          <button
            onClick={handleSelectAll}
            className="text-sm text-[var(--accent)] hover:underline"
          >
            {toolList.every((t) => t.selected) ? 'Deseleccionar todo' : 'Seleccionar todo'}
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-4 text-[var(--text)]">Cargando herramientas...</div>
        ) : filteredTools.length === 0 ? (
          <div className="text-center py-4 text-[var(--text)]">
            {searchTerm ? 'No se encontraron herramientas' : 'No hay herramientas disponibles'}
          </div>
        ) : (
          <div className="space-y-2 max-h-[40vh] overflow-y-auto">
            {filteredTools.map((tool) => (
              <div
                key={tool.id}
                className={`p-3 rounded-lg border transition-colors ${
                  tool.selected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-[var(--border)] hover:border-[var(--accent)]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id={`tool-${tool.id}`}
                    checked={tool.selected}
                    onChange={() => handleToggleTool(tool.id)}
                    className="mt-1 w-4 h-4 text-primary-600 rounded border-[var(--input-border)] focus:ring-primary-500"
                  />
                  <label
                    htmlFor={`tool-${tool.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[var(--text-h)]">{tool.name}</p>
                        <p className="text-sm text-[var(--text)]">
                          {categoryLabel(tool.category)} • ${tool.price.toFixed(2)} •{' '}
                          <span className="text-[var(--accent)]">
                            {tool.unassignedQuantity} disponible(s)
                          </span>
                        </p>
                      </div>
                    </div>
                    {tool.selected && (
                      <div className="mt-2 flex items-center gap-2">
                        <label className="text-sm text-[var(--text)]">Estado:</label>
                        <select
                          value={tool.state}
                          onChange={(e) => handleStateChange(tool.id, e.target.value as ToolState)}
                          className="px-2 py-1 text-sm rounded border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--text-h)] focus:outline-none focus:ring-2 focus:border-primary-500"
                        >
                          {TOOL_STATES.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}