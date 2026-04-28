import { useState, useEffect, useMemo } from 'react'
import { Button, Select, IconSearch, IconUser } from '../components/atoms'
import { ToastContainer } from '../components/organisms'
import { Modal } from '../components/molecules/Modal'
import { useWorkers } from '../hooks/useWorkers'
import { useAssignmentsByWorker } from '../hooks/useAssignments'
import { WORKER_AREAS, type WorkerArea, type Assignment } from '../types/worker'
import { formatDate as formatDateUtil } from '../utils/toolUtils'
import { getStateLabel, getStateStyle } from '../utils/toolUtils'

type RequestType = 'PRIMERA_VEZ' | 'SE_ROMPIO' | 'DESGASTE' | 'SE_PERDIO'
type ModalStep = 'type' | 'tool'

const REQUEST_TYPE_OPTIONS = [
  { value: 'PRIMERA_VEZ', label: 'PRIMERA VEZ' },
  { value: 'SE_ROMPIO', label: 'SE ROMPIO' },
  { value: 'DESGASTE', label: 'DESGASTE' },
  { value: 'SE_PERDIO', label: 'SE PERDIO' },
]

export const RequestsPage = () => {
  const { data: workers = [], isLoading, error } = useWorkers()
  
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterArea, setFilterArea] = useState<WorkerArea | ''>('')
  const [selectedWorker, setSelectedWorker] = useState<typeof workers[0] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [requestType, setRequestType] = useState<RequestType>('' as RequestType)
  const [modalStep, setModalStep] = useState<ModalStep>('type')
  const [selectedTool, setSelectedTool] = useState<Assignment | null>(null)

  const numericWorkerId = selectedWorker ? Number(selectedWorker.id) : 0
  const { data: workerAssignments = [], isLoading: loadingAssignments } = useAssignmentsByWorker(numericWorkerId)

  const REQUIRES_TOOL = ['SE_ROMPIO', 'DESGASTE', 'SE_PERDIO'].includes(requestType)

  const filteredWorkers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    return workers.filter((worker) => {
      const matchesSearch = !term || 
        worker.name.toLowerCase().includes(term) ||
        worker.lastname.toLowerCase().includes(term) ||
        worker.worker_code.toLowerCase().includes(term)
      const matchesArea = !filterArea || worker.area === filterArea
      return matchesSearch && matchesArea
    })
  }, [workers, searchTerm, filterArea])

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const handleClearFilters = () => {
    setSearchInput('')
    setSearchTerm('')
    setFilterArea('')
  }

  const handleStartRequest = (worker: typeof workers[0]) => {
    setSelectedWorker(worker)
    setRequestType('' as RequestType)
    setModalStep('type')
    setSelectedTool(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedWorker(null)
    setRequestType('' as RequestType)
    setModalStep('type')
    setSelectedTool(null)
  }

  const handleRequestTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as RequestType
    setRequestType(newType)
    setSelectedTool(null)
    if (newType && REQUIRES_TOOL) {
      setModalStep('tool')
    } else {
      setModalStep('type')
    }
  }

  const formatDate = () => {
    const now = new Date()
    const day = String(now.getDate()).padStart(2, '0')
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const year = now.getFullYear()
    return `${day}/${month}/${year}`
  }

  const hasFilters = searchTerm || filterArea

  const areaOptions = [
    { value: '', label: 'Todas las áreas' },
    ...WORKER_AREAS.map((a) => ({ value: a.value, label: a.label })),
  ]

  return (
    <div className="admin-module">
      <ToastContainer />

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--text-h)] mb-2">Solicitudes</h2>
        <p className="text-[var(--text)] text-sm">Gestiona las solicitudes de herramientas</p>
      </div>

      <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-[var(--text-h)] mb-1.5">
              Buscar trabajador
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text)]">
                <IconSearch className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar por nombre o código..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--text-h)] placeholder:text-[var(--text)] focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500/20 transition-all"
              />
            </div>
          </div>

          <div className="w-full md:w-64">
            <Select
              label="Filtrar por área"
              options={areaOptions}
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value as WorkerArea | '')}
            />
          </div>

          {(searchTerm || filterArea) && (
            <Button variant="ghost" size="md" onClick={handleClearFilters}>
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>

      {filteredWorkers.length === 0 ? (
        <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-12 text-center">
          <div className="flex justify-center mb-4">
            <IconUser className="w-16 h-16 text-[var(--text)] opacity-40" />
          </div>
          {hasFilters ? (
            <>
              <h3 className="text-lg font-semibold text-[var(--text-h)] mb-2">
                No se encontraron resultados
              </h3>
              <p className="text-[var(--text)] text-sm mb-4">
                Intenta con otros filtros o términos de búsqueda
              </p>
              <Button variant="outline" onClick={handleClearFilters}>
                Limpiar filtros
              </Button>
            </>
          ) : isLoading ? (
            <>
              <h3 className="text-lg font-semibold text-[var(--text-h)] mb-2">
                Cargando trabajadores...
              </h3>
            </>
          ) : error ? (
            <>
              <h3 className="text-lg font-semibold text-[var(--text-h)] mb-2">
                Error al cargar trabajadores
              </h3>
              <p className="text-[var(--text)] text-sm mb-4">
                No se pudieron conectar con el servidor
              </p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-[var(--text-h)] mb-2">
                No hay trabajadores registrados
              </h3>
              <p className="text-[var(--text)] text-sm mb-4">
                No hay trabajadores disponibles para crear solicitudes
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkers.map((worker) => (
            <div key={worker.id} className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-5 flex flex-col gap-4 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-sm transition-all">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-primary-600 dark:bg-primary-500 flex items-center justify-center shrink-0">
                  <IconUser className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--text-h)] truncate">{worker.name} {worker.lastname}</p>
                  <p className="text-xs text-[var(--text)] font-mono">{worker.worker_code}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[var(--surface-50)] dark:bg-[var(--surface-700)] text-[var(--text-h)] border border-[var(--border)]">
                  {worker.area === 'montaje/desmontaje' ? 'Montaje/Desmontaje' : 'Armado/Desarmado'}
                </span>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => {}}>
                  Solicitudes
                </Button>
                <Button size="sm" onClick={() => handleStartRequest(worker)}>
                  Iniciar solicitud
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--surface-50)] dark:bg-[var(--surface-800)]">
        <p className="text-sm text-[var(--text)]">
          Mostrando <span className="font-medium text-[var(--text-h)]">{filteredWorkers.length}</span> de{' '}
          <span className="font-medium text-[var(--text-h)]">{workers.length}</span> trabajadores
        </p>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Nueva Solicitud"
        size="lg"
      >
        {selectedWorker && (
          <div className="space-y-6">
            <div className="bg-[var(--surface-50)] dark:bg-[var(--surface-800)] border border-[var(--border)] rounded-lg p-4">
              <div className="flex flex-col gap-2">
                <p className="text-lg font-bold text-[var(--text-h)]">
                  SOLICITUD DE {selectedWorker.name} {selectedWorker.lastname}
                </p>
                <p className="text-sm text-[var(--text)]">
                  NTRABAJADOR: <span className="font-mono font-semibold">{selectedWorker.worker_code}</span>
                </p>
                <p className="text-sm text-[var(--text)]">
                  FECHA: <span className="font-semibold">{formatDate()}</span>
                </p>
              </div>
            </div>

            {modalStep === 'type' && (
              <>
                <Select
                  label="TIPO DE SOLICITUD"
                  options={REQUEST_TYPE_OPTIONS}
                  value={requestType}
                  onChange={handleRequestTypeChange}
                />

                <div className="flex gap-3 justify-end pt-4">
                  <Button variant="outline" onClick={handleCloseModal}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => {
                      if (REQUIRES_TOOL) {
                        setModalStep('tool')
                      }
                    }}
                    disabled={!requestType || (REQUIRES_TOOL && workerAssignments.length === 0)}
                  >
                    {REQUIRES_TOOL ? 'Seleccionar herramienta' : 'Crear Solicitud'}
                  </Button>
                </div>
              </>
            )}

            {modalStep === 'tool' && (
              <>
                <div className="mb-4">
                  <button
                    onClick={() => setModalStep('type')}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                  >
                    ← Volver al tipo de solicitud
                  </button>
                </div>

                <div>
                  <h4 className="font-semibold text-[var(--text-h)] mb-3">
                    Selecciona la herramienta a reemplazar
                  </h4>

                  {loadingAssignments ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : workerAssignments.length === 0 ? (
                    <p className="text-[var(--text)] text-sm py-4 text-center">
                      Este trabajador no tiene herramientas asignadas
                    </p>
                  ) : (
                    <div className="border border-[var(--border)] rounded-lg overflow-hidden divide-y divide-[var(--border)] max-h-80 overflow-y-auto">
                      {workerAssignments.map((assignment) => {
                        const isSelected = selectedTool?.id === assignment.id
                        return (
                          <button
                            key={assignment.id}
                            onClick={() => setSelectedTool(assignment)}
                            className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-colors ${
                              isSelected
                                ? 'bg-primary-50 dark:bg-primary-900/20 border-l-2 border-l-primary-500'
                                : 'hover:bg-[var(--accent-bg)] border-l-2 border-l-transparent'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-[var(--text-h)] text-sm truncate">
                                {assignment.tool?.name ?? `Herramienta #${assignment.tool_id}`}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-[var(--text)]">
                                  Cantidad: {assignment.assigned_quantity}
                                </span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStateStyle(assignment.state)}`}>
                                  {getStateLabel(assignment.state)}
                                </span>
                                <span className="text-xs text-[var(--text)]">
                                  {formatDateUtil(assignment.date)}
                                </span>
                                {assignment.tool?.supplier && (
                                  <span className="text-xs text-[var(--text)]">
                                    Proveedor: {assignment.tool.supplier}
                                  </span>
                                )}
                              </div>
                            </div>
                            {isSelected && (
                              <span className="text-primary-600 dark:text-primary-400">✓</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <Button variant="outline" onClick={handleCloseModal}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => {}}
                    disabled={!selectedTool}
                  >
                    Crear Solicitud
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}