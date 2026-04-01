import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, IconMinus, IconSearch, IconPackage, IconUser, IconTrash } from '../components/atoms'
import { ToastContainer } from '../components/organisms'
import { useToastStore } from '../stores/toastStore'
import { useWorkers } from '../hooks/useWorkers'
import { useAssignmentsByWorker, useUpdateAssignment, useDeleteAssignment } from '../hooks/useAssignments'
import { useDebounceSearch } from '../hooks/useDebounceSearch'
import { formatAreaLabel, getStateLabel, getStateStyle } from '../utils/toolUtils'
import type { AssignmentWithTool } from '../types/worker'

export const ReassignToolsPage = () => {
  const { workerId } = useParams<{ workerId: string }>()
  const navigate = useNavigate()
  const { addToast } = useToastStore()
  const { data: workers = [], isLoading: workersLoading } = useWorkers()
  
  const numericWorkerId = Number(workerId)

  const { data: assignments = [], isLoading: assignmentsLoading } = useAssignmentsByWorker(numericWorkerId)
  
  const { updateAssignment, isUpdating } = useUpdateAssignment()
  const { deleteAssignment, isDeleting } = useDeleteAssignment()

  const { searchTerm, debouncedSearch, setSearchTerm, clearSearch } = useDebounceSearch({
    delay: 300,
  })

  const worker = workers.find((w) => w.id === Number(workerId))
  const [removeQty, setRemoveQty] = useState<Record<number, number>>({})

  const filteredAssignments = useMemo((): AssignmentWithTool[] => {
    const term = debouncedSearch.toLowerCase()
    return (assignments as AssignmentWithTool[]).filter(
      (a) => a.tool?.name?.toLowerCase().includes(term) || `Herramienta #${a.tool_id}`.toLowerCase().includes(term)
    )
  }, [assignments, debouncedSearch])

  const isLoading = workersLoading || assignmentsLoading
  const isPending = isUpdating || isDeleting

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
    } catch {
      addToast('Error al actualizar', 'error')
    }
  }

  const handleRemoveQuantity = async (assignment: AssignmentWithTool) => {
    const qty = removeQty[assignment.id] || 1

    try {
      if (qty >= assignment.assigned_quantity) {
        await deleteAssignment(assignment.id)
      } else {
        await updateAssignment({
          id: assignment.id,
          data: { assigned_quantity: assignment.assigned_quantity - qty },
        })
      }
      addToast('Cantidad actualizada', 'success')
    } catch {
      addToast('Error al actualizar', 'error')
    }
  }

  const handleRemoveAll = async (assignment: AssignmentWithTool) => {
    try {
      await deleteAssignment(assignment.id)
      addToast('Herramienta eliminada', 'success')
    } catch {
      addToast('Error al eliminar', 'error')
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

  return (
    <div className="admin-module">
      <ToastContainer />

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--text-h)] mb-2">
          Reasignar Herramientas
        </h2>
        <p className="text-[var(--text)] text-sm">
          {worker 
            ? `Gestiona las herramientas de ${worker.name} ${worker.lastname}` 
            : 'Gestiona las herramientas del trabajador'}
        </p>
      </div>

      {worker && (
        <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
              <IconUser className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[var(--text-h)]">
                {worker.name} {worker.lastname}
              </h3>
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-surface-100 text-surface-700">
                {formatAreaLabel(worker.area)}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-[var(--text)]">Total herramientas</p>
              <p className="text-lg font-bold text-primary-600">
                {assignments.length}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-[var(--text-h)] mb-1.5">
              Buscar herramienta
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text)]">
                <IconSearch className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--text-h)] placeholder:text-[var(--text)] focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500/20 transition-all"
              />
            </div>
          </div>
          {searchTerm && (
            <Button variant="ghost" size="md" onClick={clearSearch}>
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {filteredAssignments.length === 0 ? (
        <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-12 text-center">
          <div className="flex justify-center mb-4">
            <IconPackage className="w-16 h-16 text-[var(--text)] opacity-40" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-h)] mb-2">
            {debouncedSearch ? 'No se encontraron herramientas' : 'No hay herramientas asignadas'}
          </h3>
          <p className="text-[var(--text)] text-sm">
            {debouncedSearch 
              ? `No hay herramientas que coincidan con "${debouncedSearch}"` 
              : 'Este trabajador no tiene herramientas asignadas'}
          </p>
        </div>
      ) : (
        <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--surface-50)] border-b border-[var(--border)]">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-h)]">Herramienta</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-[var(--text-h)]">Cantidad</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-h)]">Estado</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-[var(--text-h)]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((assignment) => (
                  <tr 
                    key={assignment.id} 
                    className="border-b border-[var(--border)] hover:bg-[var(--accent-bg)] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                          <IconPackage className="w-5 h-5 text-primary-600" />
                        </div>
                        <span className="font-medium text-[var(--text-h)]">
                          {assignment.tool?.name || `Herramienta #${assignment.tool_id}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleRemoveOne(assignment)}
                          disabled={isPending}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--input-border)] text-[var(--text)] hover:bg-surface-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          <IconMinus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-semibold text-primary-600">
                          {assignment.assigned_quantity}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStateStyle(assignment.state)}`}>
                        {getStateLabel(assignment.state)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={1}
                            max={assignment.assigned_quantity}
                            value={removeQty[assignment.id] || 1}
                            onChange={(e) =>
                              setRemoveQty((prev) => ({
                                ...prev,
                                [assignment.id]: Number(e.target.value),
                              }))
                            }
                            className="w-16 px-2 py-1.5 text-center rounded-lg border border-[var(--input-border)] bg-white text-sm text-[var(--text-h)] focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500/20"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveQuantity(assignment)}
                            disabled={isPending}
                          >
                            Quitar
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveAll(assignment)}
                          disabled={isPending}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <IconTrash className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--surface-50)]">
            <p className="text-sm text-[var(--text)]">
              Mostrando <span className="font-medium text-[var(--text-h)]">{filteredAssignments.length}</span> de{' '}
              <span className="font-medium text-[var(--text-h)]">{assignments.length}</span> herramientas
            </p>
          </div>
        </div>
      )}

      <div className="mt-6">
        <Button variant="ghost" onClick={() => navigate('/admin/workers')}>
          ← Volver a trabajadores
        </Button>
      </div>
    </div>
  )
}