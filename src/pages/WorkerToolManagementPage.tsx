import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, IconPlus, IconMinus, IconSearch, IconPackage, IconUser, IconCheck, IconTrash } from '../components/atoms'
import { ToastContainer, ConfirmDeleteModal } from '../components/organisms'
import { useTools } from '../hooks/useTools'
import { useWorkers } from '../hooks/useWorkers'
import { useAssignmentsByWorker, useCreateAssignment, useUpdateAssignment, useDeleteAssignment } from '../hooks/useAssignments'
import { useToastStore } from '../stores/toastStore'
import { useDebounceSearch } from '../hooks/useDebounceSearch'
import { TOOL_STATES, type ToolState, type AssignmentWithTool } from '../types/worker'
import { formatAreaLabel, getStockStyle } from '../utils/toolUtils'

interface ToolSelection {
  id: number
  name: string
  supplier: string
  unassignedQuantity: number
  quantity: number
  states: ToolState[]
}

export const WorkerToolManagementPage = () => {
  const { workerId } = useParams<{ workerId: string }>()
  const navigate = useNavigate()
  const { addToast } = useToastStore()
  
  const { data: workers = [], isLoading: workersLoading } = useWorkers()
  const { tools, isLoading: toolsLoading } = useTools()
  
  const numericWorkerId = Number(workerId)
  const { data: assignments = [], isLoading: assignmentsLoading, refetch: refetchAssignments } = useAssignmentsByWorker(numericWorkerId)
  
  const { createAssignment, isCreating } = useCreateAssignment()
  const { updateAssignment, isUpdating } = useUpdateAssignment()
  const { deleteAssignment, isDeleting } = useDeleteAssignment()

  const { searchTerm: searchTools, debouncedSearch: debouncedSearchTools, setSearchTerm: setSearchToolsTerm, clearSearch: clearSearchTools } = useDebounceSearch({ delay: 300 })
  const { searchTerm: searchAssigned, debouncedSearch: debouncedSearchAssigned, setSearchTerm: setSearchAssignedTerm, clearSearch: clearSearchAssigned } = useDebounceSearch({ delay: 300 })

  const worker = workers.find((w) => w.id === Number(workerId))
  
  const [selectedToolsState, setSelectedToolsState] = useState<Record<number, { quantity: number; states: ToolState[] }>>({})
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingAssignment, setDeletingAssignment] = useState<AssignmentWithTool | null>(null)

  const toolList = useMemo((): ToolSelection[] => {
    return (tools ?? []).map((t) => ({
      id: Number(t.id),
      name: t.name,
      supplier: t.supplier,
      unassignedQuantity: t.unassignedQuantity,
      quantity: selectedToolsState[Number(t.id)]?.quantity ?? 0,
      states: selectedToolsState[Number(t.id)]?.states ?? [],
    }))
  }, [tools, selectedToolsState])

  const filteredAvailableTools = useMemo(() => {
    const term = debouncedSearchTools.toLowerCase()
    return toolList.filter((t) => t.name.toLowerCase().includes(term))
  }, [toolList, debouncedSearchTools])

  const filteredAssignments = useMemo((): AssignmentWithTool[] => {
    const term = debouncedSearchAssigned.toLowerCase()
    return (assignments as AssignmentWithTool[]).filter(
      (a) => a.tool?.name?.toLowerCase().includes(term) || `Herramienta #${a.tool_id}`.toLowerCase().includes(term)
    )
  }, [assignments, debouncedSearchAssigned])

  const selectedTools = useMemo(() => toolList.filter((t) => t.quantity > 0), [toolList])
  const selectedCount = selectedTools.length
  const totalItems = selectedTools.reduce((acc, t) => acc + t.quantity, 0)

  const isLoading = workersLoading || toolsLoading || assignmentsLoading
  const isPending = isUpdating || isDeleting || isCreating

  const increaseQuantity = (id: number) => {
    setSelectedToolsState((prev) => {
      const current = prev[id] || { quantity: 0, states: [] }
      return {
        ...prev,
        [id]: {
          quantity: current.quantity + 1,
          states: [...current.states, 'nuevo'],
        },
      }
    })
  }

  const decreaseQuantity = (id: number) => {
    setSelectedToolsState((prev) => {
      const current = prev[id]
      if (!current || current.quantity === 0) return prev
      return {
        ...prev,
        [id]: {
          quantity: current.quantity - 1,
          states: current.states.slice(0, -1),
        },
      }
    })
  }

  const handleStateChange = (id: number, index: number, state: ToolState) => {
    setSelectedToolsState((prev) => {
      const current = prev[id]
      if (!current) return prev
      const newStates = [...current.states]
      newStates[index] = state
      return {
        ...prev,
        [id]: { ...current, states: newStates },
      }
    })
  }

  const handleAssignTools = async () => {
    if (selectedCount === 0) {
      addToast('Selecciona al menos una herramienta', 'error')
      return
    }

    try {
      const today = new Date().toISOString().split('T')[0]
      
      const newAssignments = selectedTools.flatMap((tool) =>
        tool.states.map((state) => ({
          worker_id: numericWorkerId,
          tool_id: tool.id,
          assigned_quantity: 1,
          state,
          date: today,
        }))
      )
      
      await Promise.all(
        newAssignments.map((assignment) => createAssignment(assignment))
      )

      addToast('Herramientas asignadas correctamente', 'success')
      
      setSelectedToolsState({})
      
      await refetchAssignments()
    } catch {
      addToast('Error al asignar herramientas', 'error')
    }
  }

  const handleRemoveOne = async (assignment: AssignmentWithTool) => {
    try {
      if (assignment.assigned_quantity > 1) {
        await updateAssignment({
          id: assignment.id,
          data: { assigned_quantity: assignment.assigned_quantity - 1 },
        })
      } else {
        await deleteAssignment(assignment.id)
      }
      addToast('Cantidad actualizada', 'success')
      await refetchAssignments()
    } catch {
      addToast('Error al actualizar', 'error')
    }
  }

  const handleRemoveAll = (assignment: AssignmentWithTool) => {
    setDeletingAssignment(assignment)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteAssignment = async () => {
    if (!deletingAssignment) return
    try {
      await deleteAssignment(deletingAssignment.id)
      addToast('Herramienta eliminada', 'success')
      await refetchAssignments()
    } catch {
      addToast('Error al eliminar', 'error')
    }
    setIsDeleteModalOpen(false)
    setDeletingAssignment(null)
  }

  const handleStateUpdate = async (assignment: AssignmentWithTool, newState: ToolState) => {
    try {
      await updateAssignment({
        id: assignment.id,
        data: { state: newState },
      })
      addToast('Estado actualizado', 'success')
      await refetchAssignments()
    } catch {
      addToast('Error al actualizar estado', 'error')
    }
  }

  if (isLoading) {
    return (
      <div className="admin-module">
        <ToastContainer />
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!worker) {
    return (
      <div className="admin-module">
        <ToastContainer />
        <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-12 text-center">
          <div className="flex justify-center mb-4">
            <IconUser className="w-16 h-16 text-[var(--text)] opacity-40" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-h)] mb-2">
            Trabajador no encontrado
          </h3>
          <p className="text-[var(--text)] text-sm mb-4">
            El trabajador que buscas no existe o ha sido eliminado
          </p>
          <Button onClick={() => navigate('/admin/workers')}>
            Volver a trabajadores
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-module">
      <ToastContainer />

      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/workers')}>
          ← Volver a trabajadores
        </Button>
      </div>

      <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
            <IconUser className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[var(--text-h)] text-lg">
              {worker.name} {worker.lastname}
            </h3>
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-surface-100 text-surface-700">
              {formatAreaLabel(worker.area)}
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm text-[var(--text)]">Herramientas asignadas</p>
            <p className="text-2xl font-bold text-primary-600">
              {assignments.length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--text-h)] text-lg">
                Herramientas Asignadas
              </h3>
              <span className="text-sm text-[var(--text)]">
                {filteredAssignments.length} de {assignments.length}
              </span>
            </div>

            <div className="relative mb-4">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text)]">
                <IconSearch className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchAssigned}
                onChange={(e) => setSearchAssignedTerm(e.target.value)}
                placeholder="Buscar en asignadas..."
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--text-h)] placeholder:text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500/20 transition-all"
              />
              {searchAssigned && (
                <button
                  onClick={clearSearchAssigned}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text)] hover:text-[var(--text-h)]"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl overflow-hidden flex-1">
            {filteredAssignments.length === 0 ? (
              <div className="p-8 text-center">
                <div className="flex justify-center mb-3">
                  <IconPackage className="w-12 h-12 text-[var(--text)] opacity-40" />
                </div>
                <p className="text-[var(--text)] text-sm">
                  {searchAssigned ? 'No se encontraron herramientas' : 'No hay herramientas asignadas'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-[var(--surface-50)] sticky top-0">
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-h)]">Herramienta</th>
                      <th className="text-left px-3 py-3 text-xs font-semibold text-[var(--text-h)]">Proveedor</th>
                      <th className="text-center px-3 py-3 text-xs font-semibold text-[var(--text-h)]">Cant</th>
                      <th className="text-left px-3 py-3 text-xs font-semibold text-[var(--text-h)]">Estado</th>
                      <th className="text-right px-3 py-3 text-xs font-semibold text-[var(--text-h)]">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssignments.map((assignment) => (
                      <tr key={assignment.id} className="border-b border-[var(--border)] hover:bg-[var(--accent-bg)] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                              <IconPackage className="w-4 h-4 text-primary-600" />
                            </div>
                            <span className="font-medium text-[var(--text-h)] text-sm truncate max-w-[120px]">
                              {assignment.tool?.name || `Herramienta #${assignment.tool_id}`}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-left">
                          <span className="text-xs text-[var(--text)]">
                            {assignment.tool?.supplier || '-'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleRemoveOne(assignment)}
                              disabled={isPending}
                              className="w-6 h-6 flex items-center justify-center rounded border border-[var(--input-border)] text-[var(--text)] hover:bg-surface-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                              <IconMinus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center font-semibold text-primary-600 text-sm">
                              {assignment.assigned_quantity}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <select
                            value={assignment.state}
                            onChange={(e) => handleStateUpdate(assignment, e.target.value as ToolState)}
                            className="px-2 py-1 rounded border border-[var(--input-border)] bg-white text-xs text-[var(--text-h)] focus:outline-none focus:ring-1 focus:border-primary-500"
                          >
                            {TOOL_STATES.map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveAll(assignment)}
                              disabled={isPending}
                              className="text-red-600 hover:bg-red-50 p-1"
                            >
                              <IconTrash className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--text-h)] text-lg">
                Asignar Nuevas Herramientas
              </h3>
              {selectedCount > 0 && (
                <span className="text-sm text-primary-600 font-medium">
                  {totalItems} {totalItems === 1 ? 'herramienta' : 'herramientas'}
                </span>
              )}
            </div>

            <div className="relative mb-4">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text)]">
                <IconSearch className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchTools}
                onChange={(e) => setSearchToolsTerm(e.target.value)}
                placeholder="Buscar herramienta..."
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--text-h)] placeholder:text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500/20 transition-all"
              />
              {searchTools && (
                <button
                  onClick={clearSearchTools}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text)] hover:text-[var(--text-h)]"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl overflow-hidden flex-1">
            {filteredAvailableTools.length === 0 ? (
              <div className="p-8 text-center">
                <div className="flex justify-center mb-3">
                  <IconPackage className="w-12 h-12 text-[var(--text)] opacity-40" />
                </div>
                <p className="text-[var(--text)] text-sm">
                  {searchTools ? 'No se encontraron herramientas' : 'No hay herramientas disponibles'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-[var(--surface-50)] sticky top-0">
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-h)]">Herramienta</th>
                      <th className="text-left px-3 py-3 text-xs font-semibold text-[var(--text-h)]">Proveedor</th>
                      <th className="text-center px-3 py-3 text-xs font-semibold text-[var(--text-h)]">Stock</th>
                      <th className="text-center px-3 py-3 text-xs font-semibold text-[var(--text-h)]">Cant</th>
                      <th className="text-left px-3 py-3 text-xs font-semibold text-[var(--text-h)]">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAvailableTools.map((tool) => {
                      const stockInfo = getStockStyle(tool.unassignedQuantity)
                      return (
                        <tr 
                          key={tool.id} 
                          className={`border-b border-[var(--border)] hover:bg-[var(--accent-bg)] transition-colors ${tool.quantity > 0 ? 'bg-primary-50/30' : ''}`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                tool.quantity > 0 ? 'bg-primary-100' : 'bg-surface-100'
                              }`}>
                                <IconPackage className={`w-4 h-4 ${
                                  tool.quantity > 0 ? 'text-primary-600' : 'text-surface-400'
                                }`} />
                              </div>
                              <span className="font-medium text-[var(--text-h)] text-sm truncate max-w-[120px]">{tool.name}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-left">
                            <span className="text-xs text-[var(--text)]">{tool.supplier || '-'}</span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 text-xs font-medium ${stockInfo.className}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${stockInfo.dotClassName}`}></span>
                              {stockInfo.label}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => decreaseQuantity(tool.id)}
                                disabled={tool.quantity === 0}
                                className="w-6 h-6 flex items-center justify-center rounded border border-[var(--input-border)] text-[var(--text)] hover:bg-surface-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                              >
                                <IconMinus className="w-3 h-3" />
                              </button>
                              <span className={`w-6 text-center font-semibold text-sm ${
                                tool.quantity > 0 ? 'text-primary-600' : 'text-[var(--text)]'
                              }`}>
                                {tool.quantity}
                              </span>
                              <button
                                onClick={() => increaseQuantity(tool.id)}
                                disabled={
                                  tool.quantity === tool.unassignedQuantity ||
                                  tool.unassignedQuantity === 0
                                }
                                className="w-6 h-6 flex items-center justify-center rounded border border-[var(--input-border)] text-[var(--text)] hover:bg-surface-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                              >
                                <IconPlus className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            {tool.quantity > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {tool.states.map((state, idx) => (
                                  <select
                                    key={idx}
                                    value={state}
                                    onChange={(e) =>
                                      handleStateChange(tool.id, idx, e.target.value as ToolState)
                                    }
                                    className="px-2 py-1 rounded border border-[var(--input-border)] bg-white text-xs text-[var(--text-h)] focus:outline-none focus:ring-1 focus:border-primary-500"
                                  >
                                    {TOOL_STATES.map((s) => (
                                      <option key={s.value} value={s.value}>
                                        {s.label}
                                      </option>
                                    ))}
                                  </select>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[var(--text)] text-xs">-</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-end gap-3">
            <Button
              onClick={handleAssignTools}
              isLoading={isCreating}
              disabled={selectedCount === 0}
            >
              <IconCheck className="w-4 h-4" />
              Asignar {selectedCount > 0 && `(${totalItems})`}
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setDeletingAssignment(null)
        }}
        onConfirm={confirmDeleteAssignment}
        itemName={deletingAssignment?.tool?.name || `Herramienta #${deletingAssignment?.tool_id}`}
        itemType="herramienta asignada"
        isLoading={isDeleting}
      />
    </div>
  )
}