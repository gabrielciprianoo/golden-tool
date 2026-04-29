import { useState, useEffect, useMemo } from 'react'
import { Button, Input, Select, IconSearch, IconUser } from '../components/atoms'
import { ToastContainer } from '../components/organisms'
import { Modal } from '../components/molecules/Modal'
import { FormField } from '../components/molecules'
import { SignatureModal } from '../components/molecules/SignatureModal'
import { SignatureDisplay } from '../components/molecules/SignatureDisplay'
import { useWorkers } from '../hooks/useWorkers'
import { useCreateRequest } from '../hooks/useRequests'
import { WORKER_AREAS, type WorkerArea } from '../types/worker'

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
  
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterArea, setFilterArea] = useState<WorkerArea | ''>('')
  const [selectedWorker, setSelectedWorker] = useState<typeof workers[0] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [requestType, setRequestType] = useState<RequestType>('' as RequestType)
  const [toolDetails, setToolDetails] = useState('')
  const [preferredBrand, setPreferredBrand] = useState('')
  const [showSignatureSection, setShowSignatureSection] = useState(false)
  const [applicantSignature, setApplicantSignature] = useState('')
  const [authorizationSignature, setAuthorizationSignature] = useState('')
  const [signatureModalType, setSignatureModalType] = useState<'applicant' | 'authorization' | null>(null)

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
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedWorker(null)
    setRequestType('' as RequestType)
    setToolDetails('')
    setPreferredBrand('')
    setShowSignatureSection(false)
    setApplicantSignature('')
    setAuthorizationSignature('')
    setSignatureModalType(null)
  }

  const handleCreateRequest = () => {
    if (!requestType) {
      alert('Por favor selecciona un tipo de solicitud')
      return
    }
    if (!toolDetails) {
      alert('Por favor ingresa los detalles de la herramienta')
      return
    }
    setShowSignatureSection(true)
  }

  const handleSaveRequest = async () => {
    if (!applicantSignature) {
      alert('Por favor firma como solicitante')
      return
    }
    if (!authorizationSignature) {
      alert('Por favor firma la autorización')
      return
    }
    if (!selectedWorker) return

    try {
      const result = await createRequest.mutateAsync({
        worker_id: Number(selectedWorker.id),
        type_request: requestType,
        details_tool: toolDetails,
        preferred_brand: preferredBrand || undefined,
        signa_applicant: applicantSignature,
        signa_authorization: authorizationSignature,
      })

      if ('success' in result && result.success) {
        alert('Solicitud creada correctamente!')
        handleCloseModal()
      } else {
        const errorMsg = 'error' in result ? result.error : 'Error desconocido'
        alert('Error al crear solicitud: ' + errorMsg)
      }
    } catch {
      alert('Error al crear solicitud')
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
              onChange={(e) => setRequestType(e.target.value as RequestType)}
            />

            {requestType && (
              <div className="space-y-4">
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-h)] mb-2">Firma de solicitante</p>
                    <div
                      onClick={() => handleOpenSignatureModal('applicant')}
                      className="cursor-pointer hover:border-primary-500"
                    >
                      {applicantSignature ? (
                        <SignatureDisplay signature={applicantSignature} />
                      ) : (
                        <div className="h-32 border-2 border-dashed border-[var(--border)] rounded-lg bg-white flex items-center justify-center">
                          <span className="text-[var(--text)] text-sm">Firmar aquí</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-h)] mb-2">Firma de autorización</p>
                    <div
                      onClick={() => handleOpenSignatureModal('authorization')}
                      className="cursor-pointer hover:border-primary-500"
                    >
                      {authorizationSignature ? (
                        <SignatureDisplay signature={authorizationSignature} />
                      ) : (
                        <div className="h-32 border-2 border-dashed border-[var(--border)] rounded-lg bg-white flex items-center justify-center">
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
    </div>
  )
}