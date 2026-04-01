import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, IconPlus, IconMinus } from '../components/atoms'
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
  quantity: number
  state: ToolState
}

export const AssignToolsPage = () => {
  const { workerId } = useParams<{ workerId: string }>()
  const navigate = useNavigate()
  const { data: workers = [] } = useWorkers()
  const { tools, isLoading: toolsLoading, refetch } = useTools()
  const { createAssignment, isCreating } = useCreateAssignment()
  const { addToast } = useToastStore()

  const worker = workers.find((w) => w.id === Number(workerId))

  const availableTools = useMemo(() => {
    return (tools ?? []).map((t) => ({
      id: Number(t.id),
      name: t.name,
      category: t.category,
      price: Number(t.price ?? 0),
      supplier: t.supplier,
      unassignedQuantity: t.unassignedQuantity,
      quantity: 0,
      state: 'nuevo' as ToolState,
    }))
  }, [tools])

  const [toolList, setToolList] = useState<ToolSelection[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    setToolList(availableTools)
  }, [availableTools])

  const filteredTools = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return toolList.filter((t) => t.name.toLowerCase().includes(term))
  }, [toolList, searchTerm])

  const selectedCount = toolList.filter((t) => t.quantity > 0).length

  const increaseQuantity = (id: number) => {
    setToolList((prev) =>
      prev.map((t) =>
        t.id === id && t.quantity < t.unassignedQuantity
          ? { ...t, quantity: t.quantity + 1 }
          : t
      )
    )
  }

  const decreaseQuantity = (id: number) => {
    setToolList((prev) =>
      prev.map((t) =>
        t.id === id && t.quantity > 0
          ? { ...t, quantity: t.quantity - 1 }
          : t
      )
    )
  }

  const handleStateChange = (id: number, state: ToolState) => {
    setToolList((prev) =>
      prev.map((t) => (t.id === id ? { ...t, state } : t))
    )
  }

const handleSubmit = async () => {
  const selectedTools = toolList.filter((t) => t.quantity > 0)

  if (selectedTools.length === 0) {
    addToast('Selecciona al menos una herramienta', 'error')
    return
  }

  try {
    for (const tool of selectedTools) {
      await createAssignment({
        worker_id: Number(workerId),
        tool_id: tool.id,
        assigned_quantity: tool.quantity,
        state: tool.state,
        date: new Date().toISOString().split('T')[0], // 🔥 FIX
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
          <p>Trabajador no encontrado</p>
          <Button onClick={() => navigate('/admin/workers')}>
            Volver
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-module">
      <ToastContainer />

      {/* Header */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/admin/workers')}
      >
        ← Volver
      </Button>

      {/* Worker */}
      <div className="p-4 border rounded-lg my-4">
        <p className="font-bold">
          {worker.name} {worker.lastname}
        </p>
        <p>{areaLabel(worker.area)}</p>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Buscar herramienta..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 w-full p-2 border rounded"
      />

      {/* Tools */}
      {toolsLoading ? (
        <p>Cargando...</p>
      ) : (
        <div className="space-y-3">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              className={`p-4 rounded-lg border ${
                tool.quantity > 0
                  ? 'border-primary-500 bg-primary-50'
                  : ''
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{tool.name}</p>
                  <p className="text-sm">
                    ${tool.price.toFixed(2)} •{' '}
                    {tool.unassignedQuantity === 0 ? (
                      <span className="text-red-500">Sin stock</span>
                    ) : (
                      <span className="text-green-600">
                        {tool.unassignedQuantity} disponibles
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => decreaseQuantity(tool.id)}
                    disabled={tool.quantity === 0}
                    className="p-1 border rounded"
                  >
                    <IconMinus className="w-4 h-4" />
                  </button>

                  <span>{tool.quantity}</span>

                  <button
                    onClick={() => increaseQuantity(tool.id)}
                    disabled={
                      tool.quantity === tool.unassignedQuantity ||
                      tool.unassignedQuantity === 0
                    }
                    className="p-1 border rounded"
                  >
                    <IconPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {tool.quantity > 0 && (
                <select
                  value={tool.state}
                  onChange={(e) =>
                    handleStateChange(tool.id, e.target.value as ToolState)
                  }
                  className="mt-3 w-full p-2 border rounded"
                >
                  {TOOL_STATES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end mt-6 gap-3">
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