import { useState, useEffect, useMemo } from 'react'
import { Button, Input, Select, IconSearch, IconUser } from '../components/atoms'
import { ToastContainer } from '../components/organisms'
import { useToastStore } from '../stores/toastStore'
import { Modal } from '../components/molecules/Modal'
import { FormField } from '../components/molecules'
import { SignatureModal } from '../components/molecules/SignatureModal'
import { SignatureDisplay } from '../components/molecules/SignatureDisplay'
import { useWorkers } from '../hooks/useWorkers'
import { useAssignmentsByWorker } from '../hooks/useAssignments'
import { useCreateRequest } from '../hooks/useRequests'
import { RequestHistoryModal } from '../components/workers/RequestHistoryModal'
import { WORKER_AREAS, type WorkerArea, type Worker } from '../types/worker'

type RequestType = 'PRIMERA_VEZ' | 'SE_ROMPIO' | 'DESGASTE' | 'SE_PERDIO'

const REQUEST_TYPE_OPTIONS = [
  { value: 'PRIMERA_VEZ', label: 'PRIMERA VEZ' },
  { value: 'SE_ROMPIO', label: 'SE ROMPIO' },
  { value: 'DESGASTE', label: 'DESGASTE' },
  { value: 'SE_PERDIO', label: 'SE PERDIO' },
]

export const RequestsPage = () => {
  const { data: workers = [], isLoading, error } = useWorkers()
  const createRequest = useCreateRequest()
  const { addToast } = useToastStore()
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null)
  const { data: workerAssignments = [] } = useAssignmentsByWorker(selectedWorkerId ?? 0)
  
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterArea, setFilterArea] = useState<WorkerArea | ''>('')
  const [selectedWorker, setSelectedWorker] = useState<typeof workers[0] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [requestType, setRequestType] = useState<RequestType>('' as RequestType)
  const [selectedToolId, setSelectedToolId] = useState<number | ''>('')
  const [toolDetails, setToolDetails] = useState('')
  const [preferredBrand, setPreferredBrand] = useState('')
  const [showSignatureSection, setShowSignatureSection] = useState(false)
  const [applicantSignature, setApplicantSignature] = useState('')
  const [authorizationSignature, setAuthorizationSignature] = useState('')
  const [signatureModalType, setSignatureModalType] = useState<'applicant' | 'authorization' | null>(null)
  const [showRequestsModal, setShowRequestsModal] = useState(false)
  const [requestsWorker, setRequestsWorker] = useState<Worker | null>(null)

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
    setSelectedWorkerId(Number(worker.id))
    setRequestType('' as RequestType)
    setSelectedToolId('')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedWorker(null)
    setSelectedWorkerId(null)
    setRequestType('' as RequestType)
    setSelectedToolId('')
    setToolDetails('')
    setPreferredBrand('')
    setShowSignatureSection(false)
    setApplicantSignature('')
    setAuthorizationSignature('')
    setSignatureModalType(null)
  }

  const handleCreateRequest = () => {
    if (!requestType) {
      addToast('Por favor selecciona un tipo de solicitud', 'warning')
      return
    }
    const needsTool = ['SE_ROMPIO', 'DESGASTE', 'SE_PERDIO'].includes(requestType)
    if (needsTool && !selectedToolId) {
      addToast('Por favor selecciona la herramienta', 'warning')
      return
    }
    if (!toolDetails) {
      addToast('Por favor ingresa los detalles de la herramienta', 'warning')
      return
    }
    setShowSignatureSection(true)
  }

  const handleSaveRequest = async () => {
    if (!selectedWorker) return

    const needsTool = ['SE_ROMPIO', 'DESGASTE', 'SE_PERDIO'].includes(requestType)

    try {
      const result = await createRequest.mutateAsync({
        worker_id: Number(selectedWorker.id),
        tool_id: needsTool ? Number(selectedToolId) : undefined,
        type_request: requestType,
        details_tool: toolDetails,
        preferred_brand: preferredBrand || undefined,
        signa_applicant: applicantSignature || undefined,
        signa_authorization: authorizationSignature || undefined,
      })

      if ('success' in result && result.success) {
        addToast('Solicitud creada correctamente', 'success')
        handleCloseModal()
      } else {
        const errorMsg = 'error' in result ? result.error : 'Error desconocido'
        addToast('Error al crear solicitud: ' + errorMsg, 'error')
      }
    } catch {
      addToast('Error al crear solicitud', 'error')
    }
  }

  const handleOpenSignatureModal = (type: 'applicant' | 'authorization') => {
    setSignatureModalType(type)
  }

  const handleSaveSignature = (signature: string) => {
    if (signatureModalType === 'applicant') {
      setApplicantSignature(signature)
    } else if (signatureModalType === 'authorization') {
      setAuthorizationSignature(signature)
    }
    setSignatureModalType(null)
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
                <Button size="sm" variant="outline" onClick={() => {
                  setRequestsWorker(worker)
                  setShowRequestsModal(true)
                }}>
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
        size="md"
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

            <Select
              label="TIPO DE SOLICITUD"
              options={REQUEST_TYPE_OPTIONS}
              value={requestType}
              onChange={(e) => {
                setRequestType(e.target.value as RequestType)
                setSelectedToolId('')
              }}
            />

            {requestType && (
              <div className="space-y-4">
                {['SE_ROMPIO', 'DESGASTE', 'SE_PERDIO'].includes(requestType) && (
                  <Select
                    label="HERRAMIENTA"
                    options={[
                      ...workerAssignments.map((a) => ({
                        value: String(a.tool_id),
                        label: a.tool?.name ?? `Herramienta #${a.tool_id}`,
                      })),
                    ]}
                    value={selectedToolId}
                    onChange={(e) => setSelectedToolId(e.target.value as unknown as number)}
                  />
                )}
                <FormField label="DETALLES DE LA HERRAMIENTA A SOLICITAR" htmlFor="tool-details">
                  <Input
                    id="tool-details"
                    value={toolDetails}
                    onChange={(e) => setToolDetails(e.target.value)}
                    placeholder="Describe la herramienta que necesitas..."
                    required
                  />
                </FormField>
                <FormField label="MARCA PREFERENTE (OPCIONAL)" htmlFor="preferred-brand">
                  <Input
                    id="preferred-brand"
                    value={preferredBrand}
                    onChange={(e) => setPreferredBrand(e.target.value)}
                    placeholder="Ej: Makita, Dewalt, Bosch..."
                  />
                </FormField>
              </div>
            )}

            {!showSignatureSection ? (
              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateRequest}>
                  Crear Solicitud
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col gap-6">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-h)] mb-2">Firma de solicitante</p>
                    <div
                      onClick={() => handleOpenSignatureModal('applicant')}
                      className="cursor-pointer hover:border-primary-500 h-80"
                    >
                      {applicantSignature ? (
                        <SignatureDisplay signature={applicantSignature} />
                      ) : (
                        <div className="h-full border-2 border-dashed border-[var(--border)] rounded-lg bg-white flex items-center justify-center">
                          <span className="text-[var(--text)] text-sm">Firmar aquí</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-h)] mb-2">Firma de autorización</p>
                    <div
                      onClick={() => handleOpenSignatureModal('authorization')}
                      className="cursor-pointer hover:border-primary-500 h-80"
                    >
                      {authorizationSignature ? (
                        <SignatureDisplay signature={authorizationSignature} />
                      ) : (
                        <div className="h-full border-2 border-dashed border-[var(--border)] rounded-lg bg-white flex items-center justify-center">
                          <span className="text-[var(--text)] text-sm">Firmar aquí</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <Button variant="outline" onClick={handleCloseModal}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveRequest}>
                    Guardar Solicitud
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <SignatureModal
        isOpen={signatureModalType === 'applicant'}
        onClose={() => setSignatureModalType(null)}
        onSave={handleSaveSignature}
        title="Firma del solicitante"
      />

      <SignatureModal
        isOpen={signatureModalType === 'authorization'}
        onClose={() => setSignatureModalType(null)}
        onSave={handleSaveSignature}
        title="Firma de autorización"
      />

      <RequestHistoryModal
        isOpen={showRequestsModal}
        onClose={() => {
          setShowRequestsModal(false)
          setRequestsWorker(null)
        }}
        worker={requestsWorker}
      />
    </div>
  )
}