import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, IconPlus, IconMinus, IconSearch, IconPackage, IconUser, IconCheck } from '../components/atoms'
import { ToastContainer } from '../components/organisms'
import { useAvailableTools } from '../hooks/useAvailableTools'
import { useWorkers } from '../hooks/useWorkers'
import { useCreateAssignment } from '../hooks/useAssignments'
import { useToastStore } from '../stores/toastStore'
import { useDebounceSearch } from '../hooks/useDebounceSearch'
import { TOOL_STATES, type ToolState } from '../types/worker'
import { formatAreaLabel, getStockStyle, formatCurrency } from '../utils/toolUtils'

interface ToolSelection {
  id: number
  name: string
  category: string
  price: number
  supplier: string
  unassignedQuantity: number
  quantity: number
  states: ToolState[]
}

export const AssignToolsPage = () => {
  const { workerId } = useParams<{ workerId: string }>()
  const navigate = useNavigate()
  const { data: workers = [], isLoading: workersLoading } = useWorkers()
  const { tools, isLoading: toolsLoading, refetch } = useAvailableTools()
  const { createAssignment, isCreating } = useCreateAssignment()
  const { addToast } = useToastStore()
  
  const { searchTerm, debouncedSearch, setSearchTerm, clearSearch } = useDebounceSearch({
    delay: 300,
  })

  const worker = workers.find((w) => w.id === workerId)

  const availableTools = useMemo((): ToolSelection[] => {
    return tools
      .map((t) => ({
        id: Number(t.id),
        name: t.name,
        category: t.category,
        price: Number(t.price ?? 0),
        supplier: t.supplier,
        unassignedQuantity: t.unassignedQuantity,
        quantity: 0,
        states: [],
      }))
      .sort((a, b) => b.unassignedQuantity - a.unassignedQuantity)
  }, [tools])

  const [toolList, setToolList] = useState<ToolSelection[]>(() => availableTools)

  useEffect(() => {
    setToolList(availableTools)
  }, [availableTools])

  const filteredTools = useMemo(() => {
    const term = debouncedSearch.toLowerCase()
    return toolList.filter((t) => t.name.toLowerCase().includes(term))
  }, [toolList, debouncedSearch])

  const selectedTools = useMemo(
    () => toolList.filter((t) => t.quantity > 0),
    [toolList]
  )

  const selectedCount = selectedTools.length
  const totalItems = selectedTools.reduce((acc, t) => acc + t.quantity, 0)

  const increaseQuantity = (id: number) => {
    setToolList((prev) =>
      prev.map((t) =>
        t.id === id && t.quantity < t.unassignedQuantity
          ? { ...t, quantity: t.quantity + 1, states: [...t.states, 'nuevo'] }
          : t
      )
    )
  }

  const decreaseQuantity = (id: number) => {
    setToolList((prev) =>
      prev.map((t) =>
        t.id === id && t.quantity > 0
          ? { ...t, quantity: t.quantity - 1, states: t.states.slice(0, -1) }
          : t
      )
    )
  }

  const handleStateChange = (id: number, index: number, state: ToolState) => {
    setToolList((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        const newStates = [...t.states]
        newStates[index] = state
        return { ...t, states: newStates }
      })
    )
  }

  const handleSubmit = async () => {
    if (selectedCount === 0) {
      addToast('Selecciona al menos una herramienta', 'error')
      return
    }

    try {
      const today = new Date().toISOString().split('T')[0]
      
      const assignments = selectedTools.flatMap((tool) =>
        tool.states.map((state) => ({
          worker_id: Number(workerId),
          tool_id: tool.id,
          assigned_quantity: 1,
          state,
          date: today,
        }))
      )
      
      await Promise.all(
        assignments.map((assignment) =>
          createAssignment(assignment)
        )
      )

      addToast('Herramientas asignadas correctamente', 'success')
      await refetch()
      navigate('/admin/workers')
    } catch {
      addToast('Error al asignar herramientas', 'error')
    }
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

  const isLoading = workersLoading || toolsLoading

  return (
    <div className="admin-module">
      <ToastContainer />

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--text-h)] mb-2">
          Asignar Herramientas
        </h2>
        <p className="text-[var(--text)] text-sm">
          Gestiona las herramientas asignadas a {worker.name} {worker.lastname}
        </p>
      </div>

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
          {selectedCount > 0 && (
            <div className="text-right">
              <p className="text-sm text-[var(--text)]">Total seleccionado</p>
              <p className="text-lg font-bold text-primary-600">
                {totalItems} {totalItems === 1 ? 'herramienta' : 'herramientas'}
              </p>
            </div>
          )}
        </div>
      </div>

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

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredTools.length === 0 ? (
        <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-12 text-center">
          <div className="flex justify-center mb-4">
            <IconPackage className="w-16 h-16 text-[var(--text)] opacity-40" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-h)] mb-2">
            {debouncedSearch ? 'No se encontraron herramientas' : 'No hay herramientas disponibles'}
          </h3>
          <p className="text-[var(--text)] text-sm">
            {debouncedSearch 
              ? `No hay herramientas que coincidan con "${debouncedSearch}"` 
              : 'No hay herramientas en el inventario'}
          </p>
        </div>
      ) : (
        <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--surface-50)] border-b border-[var(--border)]">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-h)]">Herramienta</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-h)]">Precio</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-h)]">Stock</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-[var(--text-h)]">Cantidad</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--text-h)]">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredTools.map((tool) => {
                  const stockInfo = getStockStyle(tool.unassignedQuantity)
                  return (
                    <tr 
                      key={tool.id} 
                      className={`border-b border-[var(--border)] hover:bg-[var(--accent-bg)] transition-colors ${tool.quantity > 0 ? 'bg-primary-50/30' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            tool.quantity > 0 ? 'bg-primary-100' : 'bg-surface-100'
                          }`}>
                            <IconPackage className={`w-5 h-5 ${
                              tool.quantity > 0 ? 'text-primary-600' : 'text-surface-400'
                            }`} />
                          </div>
                          <span className="font-medium text-[var(--text-h)]">{tool.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[var(--text-h)] font-medium">
                        {formatCurrency(tool.price)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${stockInfo.className}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${stockInfo.dotClassName}`}></span>
                          {stockInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => decreaseQuantity(tool.id)}
                            disabled={tool.quantity === 0}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--input-border)] text-[var(--text)] hover:bg-surface-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            <IconMinus className="w-4 h-4" />
                          </button>
                          <span className={`w-8 text-center font-semibold ${
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
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--input-border)] text-[var(--text)] hover:bg-surface-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            <IconPlus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
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
                          <span className="text-[var(--text)] text-sm">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--surface-50)]">
            <p className="text-sm text-[var(--text)]">
              Mostrando <span className="font-medium text-[var(--text-h)]">{filteredTools.length}</span> herramientas
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-[var(--text)]">
          {selectedCount === 0 ? (
            'Selecciona herramientas para asignar'
          ) : (
            <span>
              <span className="font-semibold text-[var(--text-h)]">{selectedCount}</span> {selectedCount === 1 ? 'herramienta' : 'herramientas'} seleccionada{selectedCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/admin/workers')}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={isCreating}
            disabled={selectedCount === 0}
          >
            <IconCheck className="w-4 h-4" />
            Asignar {selectedCount > 0 && `(${selectedCount})`}
          </Button>
        </div>
      </div>
    </div>
  )
}