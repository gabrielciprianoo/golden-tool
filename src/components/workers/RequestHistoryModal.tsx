import { useState } from 'react'
import { Modal } from '../../components/organisms'
import { SignatureModal } from '../../components/molecules/SignatureModal'
import { SignatureDisplay } from '../../components/molecules/SignatureDisplay'
import { Button } from '../atoms'
import { useRequestsByWorker, useUpdateRequest } from '../../hooks/useRequests'
import { type Worker } from '../../types/worker'
import { type RequestData } from '../../services/requestService'
import { formatAreaLabel } from '../../utils/toolUtils'

interface RequestHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  worker: Worker | null
}

const typeRequestLabels: Record<string, string> = {
  PRIMERA_VEZ: 'Primera vez',
  SE_ROMPIO: 'Se rompió',
  DESGASTE: 'Desgaste',
  SE_PERDIO: 'Se perdió',
}

const stateLabels: Record<string, { label: string; className: string }> = {
  incompleta: { label: 'Incompleta', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  pendiente_aprobacion: { label: 'Pendiente de aprobación', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  cancelada: { label: 'Cancelada', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function canCompleteSignatures(req: RequestData): boolean {
  return req.state === 'incompleta'
}

function getMissingSignatures(req: RequestData): { applicant: boolean; authorization: boolean } {
  return {
    applicant: !req.signa_applicant,
    authorization: !req.signa_authorization,
  }
}

export const RequestHistoryModal = ({ isOpen, onClose, worker }: RequestHistoryModalProps) => {
  const numericWorkerId = worker ? Number(worker.id) : 0
  const [refreshKey, setRefreshKey] = useState(0)
  const { data: requests, isLoading } = useRequestsByWorker(numericWorkerId, refreshKey)
  const updateRequest = useUpdateRequest()
  
  const [signatureModalOpen, setSignatureModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<RequestData | null>(null)
  const [signatureType, setSignatureType] = useState<'applicant' | 'authorization' | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedDetailRequest, setSelectedDetailRequest] = useState<RequestData | null>(null)

  const handleOpenDetail = (req: RequestData) => {
    setSelectedDetailRequest(req)
    setDetailModalOpen(true)
  }

  if (!worker) return null

  const requestsArray = Array.isArray(requests) ? requests : []
  const incompleteRequests = requestsArray.filter(r => r.state === 'incompleta')
  const pendingApprovalRequests = requestsArray.filter(r => r.state === 'pendiente_aprobacion')
  const cancelledRequests = requestsArray.filter(r => r.state === 'cancelada')

  const handleOpenSignatureModal = (req: RequestData, type: 'applicant' | 'authorization') => {
    setSelectedRequest(req)
    setSignatureType(type)
    setSignatureModalOpen(true)
  }

  const handleSaveSignature = async (signature: string) => {
    if (!selectedRequest || !signatureType) return

    const updateData = signatureType === 'applicant'
      ? { signa_applicant: signature }
      : { signa_authorization: signature }

    try {
      await updateRequest.mutateAsync({
        id: selectedRequest.id,
        data: updateData,
      })
      setSignatureModalOpen(false)
      setSelectedRequest(null)
      setSignatureType(null)
      setRefreshKey(prev => prev + 1)
    } catch (error) {
      console.error('Error updating request:', error)
    }
  }

  const renderRequestCard = (req: RequestData) => {
    const stateInfo = stateLabels[req.state] || { label: req.state, className: 'bg-gray-100 text-gray-800' }
    const missing = getMissingSignatures(req)
    const showCompleteButton = canCompleteSignatures(req)
    const isCompleted = ['pendiente_aprobacion', 'cancelada'].includes(req.state)
    
    return (
      <div 
        key={req.id} 
        className={`bg-[var(--surface-50)] dark:bg-[var(--surface-800)] rounded-lg p-4 border border-[var(--border)] ${isCompleted ? 'cursor-pointer hover:border-primary-400 transition-colors' : ''}`}
        onClick={() => isCompleted && handleOpenDetail(req)}
      >
        <div className="flex items-start justify-between mb-2">
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-[var(--accent-bg)] text-[var(--accent)]">
            {typeRequestLabels[req.type_request] || req.type_request}
          </span>
          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${stateInfo.className}`}>
            {stateInfo.label}
          </span>
        </div>
        <p className="text-sm text-[var(--text-h)] mb-1">{req.details_tool}</p>
        {req.preferred_brand && (
          <p className="text-xs text-[var(--text)] mb-2">Marca preferida: {req.preferred_brand}</p>
        )}
        {req.tool && (
          <p className="text-xs text-[var(--text)] mb-2">Herramienta: {req.tool.name}</p>
        )}
        
        {showCompleteButton && (
          <div className="mt-3 pt-3 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--text)] mb-2 font-medium">Firmas:</p>
            <div className="flex gap-2">
              {missing.applicant ? (
                <button
                  onClick={() => handleOpenSignatureModal(req, 'applicant')}
                  className="px-3 py-1.5 text-xs rounded border border-yellow-400 text-yellow-700 bg-yellow-50 hover:bg-yellow-100 transition-colors"
                >
                  + Firma Solicitante
                </button>
              ) : (
                <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                  ✓ Firma Solicitante
                </span>
              )}
              
              {missing.authorization ? (
                <button
                  onClick={() => handleOpenSignatureModal(req, 'authorization')}
                  className="px-3 py-1.5 text-xs rounded border border-yellow-400 text-yellow-700 bg-yellow-50 hover:bg-yellow-100 transition-colors"
                >
                  + Firma Autorización
                </button>
              ) : (
                <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                  ✓ Firma Autorización
                </span>
              )}
            </div>
          </div>
        )}
        
        <p className="text-xs text-[var(--text)] opacity-70 mt-2">
          {formatDate(req.created_at)}
        </p>
      </div>
    )
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Historial de Solicitudes" size="lg">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 p-4 bg-[var(--surface-50)] dark:bg-[var(--surface-800)] rounded-lg border border-[var(--border)]">
            <div>
              <p className="text-xs text-[var(--text)]">Trabajador</p>
              <p className="font-semibold text-[var(--text-h)]">{worker.name} {worker.lastname}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--text)]">Área</p>
              <p className="font-semibold text-[var(--text-h)]">{formatAreaLabel(worker.area)}</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : requestsArray.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[var(--text)]">Este trabajador no tiene solicitudes</p>
            </div>
          ) : (
            <>
              {incompleteRequests.length > 0 && (
                <div>
                  <h4 className="font-semibold text-[var(--text-h)] mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    Incompletas ({incompleteRequests.length})
                  </h4>
                  <div className="space-y-3">
                    {incompleteRequests.map(renderRequestCard)}
                  </div>
                </div>
              )}

              {pendingApprovalRequests.length > 0 && (
                <div>
                  <h4 className="font-semibold text-[var(--text-h)] mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Pendiente de aprobación ({pendingApprovalRequests.length})
                  </h4>
                  <div className="space-y-3">
                    {pendingApprovalRequests.map(renderRequestCard)}
                  </div>
                </div>
              )}

              {cancelledRequests.length > 0 && (
                <div>
                  <h4 className="font-semibold text-[var(--text-h)] mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Canceladas ({cancelledRequests.length})
                  </h4>
                  <div className="space-y-3">
                    {cancelledRequests.map(renderRequestCard)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Modal>

      <SignatureModal
        isOpen={signatureModalOpen}
        onClose={() => {
          setSignatureModalOpen(false)
          setSelectedRequest(null)
          setSignatureType(null)
        }}
        onSave={handleSaveSignature}
        title={signatureType === 'applicant' ? 'Firma del Solicitante' : 'Firma de Autorización'}
      />

      <Modal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false)
          setSelectedDetailRequest(null)
        }}
        title="Detalles de Solicitud"
        size="xl"
      >
        {selectedDetailRequest && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[var(--text)]">Tipo de Solicitud</p>
                <p className="font-semibold text-[var(--text-h)]">
                  {typeRequestLabels[selectedDetailRequest.type_request] || selectedDetailRequest.type_request}
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--text)]">Estado</p>
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${stateLabels[selectedDetailRequest.state]?.className || 'bg-gray-100 text-gray-800'}`}>
                  {stateLabels[selectedDetailRequest.state]?.label || selectedDetailRequest.state}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm text-[var(--text)]">Detalles de la Herramienta</p>
              <p className="text-[var(--text-h)]">{selectedDetailRequest.details_tool}</p>
            </div>

            {selectedDetailRequest.preferred_brand && (
              <div>
                <p className="text-sm text-[var(--text)]">Marca Preferida</p>
                <p className="text-[var(--text-h)]">{selectedDetailRequest.preferred_brand}</p>
              </div>
            )}

            {selectedDetailRequest.tool && (
              <div>
                <p className="text-sm text-[var(--text)]">Herramienta</p>
                <p className="text-[var(--text-h)]">{selectedDetailRequest.tool.name}</p>
              </div>
            )}

            <div className="flex flex-col gap-6">
              <div>
                <p className="text-sm text-[var(--text)] mb-2">Firma del Solicitante</p>
                <div className="h-80">
                  {selectedDetailRequest.signa_applicant ? (
                    <SignatureDisplay signature={selectedDetailRequest.signa_applicant} />
                  ) : (
                    <p className="text-[var(--text)] italic">Sin firma</p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-[var(--text)] mb-2">Firma de Autorización</p>
                <div className="h-80">
                  {selectedDetailRequest.signa_authorization ? (
                    <SignatureDisplay signature={selectedDetailRequest.signa_authorization} />
                  ) : (
                    <p className="text-[var(--text)] italic">Sin firma</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border)]">
              <div>
                <p className="text-sm text-[var(--text)]">Fecha de Creación</p>
                <p className="text-[var(--text-h)]">{formatDate(selectedDetailRequest.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--text)]">Última Actualización</p>
                <p className="text-[var(--text-h)]">{formatDate(selectedDetailRequest.updated_at)}</p>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => {
                setDetailModalOpen(false)
                setSelectedDetailRequest(null)
              }}>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}