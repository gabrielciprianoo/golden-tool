import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../components/atoms'
import { ToastContainer } from '../components/organisms'
import { useTools } from '../hooks/useTools'
import { useWorkers } from '../hooks/useWorkers'
import { useCreateAssignment } from '../hooks/useAssignments'
import { useToastStore } from '../stores/toastStore'
import { TOOL_STATES, type ToolState } from '../types/worker'

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

export const AssignToolsPage = () => {
  const { workerId } = useParams<{ workerId: string }>()
  const navigate = useNavigate()
  const { data: workers = [] } = useWorkers()
  const { tools, isLoading: toolsLoading, refetch } = useTools()
  const { createAssignment, isCreating } = useCreateAssignment()
  const { addToast } = useToastStore()

  // ✅ FIX: convertir workerId a number
  const worker = workers.find((w) => w.id === Number(workerId))

  // ✅ FIX: tools seguro con ?? []
  const availableTools = useMemo(() => {
    return (tools ?? [])
      .filter((t) => t.unassignedQuantity > 0)
      .map((t) => ({
        id: Number(t.id),
        name: t.name,
        category: t.category,
        price: Number(t.price ?? 0),
        supplier: t.supplier,
        unassignedQuantity: t.unassignedQuantity,
        selected: false,
        state: 'nuevo' as ToolState,
      }))
  }, [tools])

  // 🔥 estado
  const [toolList, setToolList] = useState<ToolSelection[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  // ✅ FIX: sincronizar toolList con availableTools
  useEffect(() => {
    setToolList(availableTools)
  }, [availableTools])

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

    if (!workerId) {
      addToast('Error: Trabajador no identificado', 'error')
      return
    }

    try {
      for (const tool of selectedTools) {
        await createAssignment({
          id_worker: workerId,
          id_tool: tool.id,
          state: tool.state,
        })
      }

      addToast('Herramientas asignadas correctamente', 'success')
      await refetch()
      navigate('/admin/workers')
    } catch (error) {
      console.error(error)
      addToast('Error al asignar herramientas', 'error')
    }
  }

  const categoryLabel = (cat: string) => {
    return cat === 'normal' ? 'Normal' : 'Refacción'
  }

  const areaLabel = (area: string) => {
    return area === 'montaje/desmontaje'
      ? 'Montaje/Desmontaje'
      : 'Armado/Desarmado'
  }

  if (!worker) {
    return (
      <div className="admin-module">
        <ToastContainer />
        <div className="text-center py-12">
          <p className="text-[var(--text)]">Trabajador no encontrado</p>
          <Button className="mt-4" onClick={() => navigate('/admin/workers')}>
            Volver a Trabajadores
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-module">
      <ToastContainer />

      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin/workers')}
          className="mb-4"
        >
          ← Volver a Trabajadores
        </Button>
      </div>

      {/* Trabajador */}
      <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-6 mb-6">
        <h2 className="text-xl font-bold text-[var(--text-h)] mb-2">
          Trabajador Seleccionado
        </h2>
        <div className="flex flex-wrap gap-4 text-[var(--text)]">
          <span className="px-3 py-1.5 rounded-md text-sm bg-surface-100 dark:bg-surface-700">
            {worker.worker_code}
          </span>
          <span className="text-[var(--text-h)] font-medium">
            {worker.name} {worker.lastname}
          </span>
          <span className="px-3 py-1.5 rounded-md text-sm bg-surface-100 dark:bg-surface-700">
            {areaLabel(worker.area)}
          </span>
        </div>
      </div>

      {/* Herramientas */}
      <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-6 mb-6">
        <div className="flex justify-between mb-4">
          <input
            type="text"
            placeholder="Buscar herramienta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <button onClick={handleSelectAll}>
            {toolList.every((t) => t.selected)
              ? 'Deseleccionar todo'
              : 'Seleccionar todo'}
          </button>
        </div>

        {toolsLoading ? (
          <p>Cargando herramientas...</p>
        ) : filteredTools.length === 0 ? (
          <p>No hay herramientas disponibles</p>
        ) : (
          filteredTools.map((tool) => (
            <div key={tool.id}>
              <input
                type="checkbox"
                checked={tool.selected}
                onChange={() => handleToggleTool(tool.id)}
              />
              {tool.name} - ${Number(tool.price).toFixed(2)}

              {tool.selected && (
                <select
                  value={tool.state}
                  onChange={(e) =>
                    handleStateChange(tool.id, e.target.value as ToolState)
                  }
                >
                  {TOOL_STATES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))
        )}
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-4">
        <Button onClick={() => navigate('/admin/workers')}>
          Cancelar
        </Button>

        <Button
          onClick={handleSubmit}
          isLoading={isCreating}
          disabled={selectedCount === 0}
        >
          Asignar ({selectedCount})
        </Button>
      </div>
    </div>
  )
}