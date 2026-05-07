import { useState, useMemo, useEffect } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { useRequestsCreatedByMe, useUpdateRequest } from '../../hooks/useRequests'
import { useToastStore } from '../../stores/toastStore'
import { SignatureModal } from '../molecules/SignatureModal'
import type { RequestData } from '../../services/requestService'

const typeRequestLabels: Record<string, string> = {
  PRIMERA_VEZ: 'Primera vez',
  SE_ROMPIO: 'Se rompió',
  DESGASTE: 'Desgaste',
  SE_PERDIO: 'Se perdió',
}

const stateLabels: Record<string, { label: string; className: string }> = {
  incompleta: { label: 'Incompleta', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  pendiente_compra: { label: 'Pendiente de compra', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  pendiente_entrega: { label: 'Pendiente de entrega', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface RequestCardProps {
  request: RequestData
  onSign: (req: RequestData, type: 'applicant' | 'authorization') => void
  onConfirmDelivery: (req: RequestData) => void
}

const RequestCard: React.FC<RequestCardProps> = ({ request, onSign, onConfirmDelivery }) => {
  const missingSignatures = {
    applicant: !request.signa_applicant,
    authorization: !request.signa_authorization,
  }

  const isIncomplete = request.state === 'incompleta'
  const isPendingPurchase = request.state === 'pendiente_compra'
  const isPendingDelivery = request.state === 'pendiente_entrega'
  const stateInfo = stateLabels[request.state] || { label: request.state, className: 'bg-gray-100 text-gray-800' }

  const workerName = request.worker ? `${request.worker.name} ${request.worker.lastname}` : 'Trabajador'
  const workerCode = request.worker?.worker_code || ''

  return (
    <div className="bg-[var(--surface-50)] dark:bg-[var(--surface-800)] rounded-lg p-4 border border-[var(--border)] hover:border-primary-400 transition-all">
      <div className="bg-[var(--accent-bg)] dark:bg-[var(--surface-900)] rounded-lg p-3 mb-4">
        <p className="text-sm font-bold text-[var(--text-h)]">
          SOLICITUD DE {workerName.toUpperCase()}
        </p>
        {workerCode && (
          <p className="text-xs text-[var(--text)] font-mono">
            NTRABAJADOR: {workerCode}
          </p>
        )}
        <p className="text-xs text-[var(--text)]">
          FECHA: {formatDateTime(request.created_at)}
        </p>
      </div>

      <div className="flex items-start justify-between mb-3">
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
          {typeRequestLabels[request.type_request] || request.type_request}
        </span>
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${stateInfo.className}`}>
          {stateInfo.label}
        </span>
      </div>

      <p className="text-sm text-[var(--text-h)] mb-2 font-medium">{request.details_tool}</p>

      {request.tool && (
        <p className="text-xs text-[var(--text)] mb-2">Herramienta: {request.tool.name}</p>
      )}

      {request.preferred_brand && (
        <p className="text-xs text-[var(--text)] mb-3">Marca preferida: {request.preferred_brand}</p>
      )}

      {isIncomplete && (
        <div className="pt-3 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--text)] mb-2 font-medium">Firmas:</p>
          <div className="flex flex-wrap gap-2">
            {missingSignatures.applicant ? (
              <button
                onClick={() => onSign(request, 'applicant')}
                className="px-3 py-1.5 text-xs rounded-md border border-yellow-400 text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-colors"
              >
                + Firma Solicitante
              </button>
            ) : (
              <span className="px-2 py-1 text-xs rounded-md bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                ✓ Firma Solicitante
              </span>
            )}

            {missingSignatures.authorization ? (
              <button
                onClick={() => onSign(request, 'authorization')}
                className="px-3 py-1.5 text-xs rounded-md border border-yellow-400 text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-colors"
              >
                + Firma Autorización
              </button>
            ) : (
              <span className="px-2 py-1 text-xs rounded-md bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                ✓ Firma Autorización
              </span>
            )}
          </div>
        </div>
      )}

      {isPendingPurchase && (
        <div className="pt-3 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--text)] flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Esperando que el administrador procese la compra
          </p>
        </div>
      )}

      {isPendingDelivery && (
        <div className="pt-3 border-t border-[var(--border)]">
          <button
            onClick={() => onConfirmDelivery(request)}
            className="w-full px-3 py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Confirmar Entrega
          </button>
        </div>
      )}
    </div>
  )
}

export const HeroSection: React.FC = () => {
  const { user } = useAuthStore()
  const { data: requests = [], isLoading, refetch } = useRequestsCreatedByMe(true)
  const updateRequest = useUpdateRequest()
  const { addToast } = useToastStore()

  const [signatureModalOpen, setSignatureModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<RequestData | null>(null)
  const [signatureType, setSignatureType] = useState<'applicant' | 'authorization' | null>(null)
  const [activeFilter, setActiveFilter] = useState<'all' | 'incompleta' | 'pendiente_compra' | 'pendiente_entrega'>('all')

  const requestsArray = useMemo(() => {
    if (!Array.isArray(requests)) return []
    return requests
  }, [requests])

  const pendingSignRequests = useMemo(() => {
    return requestsArray.filter(r => r.state === 'incompleta')
  }, [requestsArray])

  const pendingPurchaseRequests = useMemo(() => {
    return requestsArray.filter(r => r.state === 'pendiente_compra')
  }, [requestsArray])

  const pendingDeliveryRequests = useMemo(() => {
    return requestsArray.filter(r => r.state === 'pendiente_entrega')
  }, [requestsArray])

  const hasAnyPending = pendingSignRequests.length > 0 || pendingPurchaseRequests.length > 0 || pendingDeliveryRequests.length > 0
  const totalPending = pendingSignRequests.length + pendingPurchaseRequests.length + pendingDeliveryRequests.length

  useEffect(() => {
    refetch()
  }, [refetch])

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
      addToast('Firma guardada correctamente', 'success')
      setSignatureModalOpen(false)
      setSelectedRequest(null)
      setSignatureType(null)
      refetch()
    } catch {
      addToast('Error al guardar la firma', 'error')
    }
  }

  const handleConfirmDelivery = async (req: RequestData) => {
    try {
      const result = await updateRequest.mutateAsync({
        id: req.id,
        data: { state: 'entrega_confirmada' },
      })
      if ('success' in result && result.success) {
        addToast('Entrega confirmada correctamente', 'success')
        refetch()
      } else {
        const errorMsg = 'error' in result ? result.error : 'Error desconocido'
        addToast('Error al confirmar entrega: ' + errorMsg, 'error')
      }
    } catch {
      addToast('Error al confirmar entrega', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">
          ¡Bienvenido, {user?.name || 'Usuario'}!
        </h1>
        <p className="text-primary-100 dark:text-primary-200 text-sm">
          Aquí puedes ver tus solicitudes pendientes
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => setActiveFilter('all')}
              className={`bg-[var(--bg)] border rounded-xl p-4 transition-all cursor-pointer hover:border-primary-500 ${
                activeFilter === 'all' 
                  ? 'border-primary-500 ring-2 ring-primary-500/20' 
                  : 'border-[var(--border)]'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-[var(--text)]">Todos</p>
                  <p className="text-2xl font-bold text-[var(--text-h)]">{totalPending}</p>
                </div>
              </div>
              <p className="text-xs text-[var(--text)]">Ver todas las solicitudes</p>
            </button>

            <button
              onClick={() => setActiveFilter('incompleta')}
              className={`bg-[var(--bg)] border rounded-xl p-4 transition-all cursor-pointer hover:border-yellow-500 ${
                activeFilter === 'incompleta' 
                  ? 'border-yellow-500 ring-2 ring-yellow-500/20' 
                  : 'border-[var(--border)]'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-[var(--text)]">Por Firmar</p>
                  <p className="text-2xl font-bold text-[var(--text-h)]">{pendingSignRequests.length}</p>
                </div>
              </div>
              <p className="text-xs text-[var(--text)]">Requieren tu firma</p>
            </button>

            <button
              onClick={() => setActiveFilter('pendiente_compra')}
              className={`bg-[var(--bg)] border rounded-xl p-4 transition-all cursor-pointer hover:border-blue-500 ${
                activeFilter === 'pendiente_compra' 
                  ? 'border-blue-500 ring-2 ring-blue-500/20' 
                  : 'border-[var(--border)]'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-[var(--text)]">Por Comprar</p>
                  <p className="text-2xl font-bold text-[var(--text-h)]">{pendingPurchaseRequests.length}</p>
                </div>
              </div>
              <p className="text-xs text-[var(--text)]">Esperando compra</p>
            </button>

            <button
              onClick={() => setActiveFilter('pendiente_entrega')}
              className={`bg-[var(--bg)] border rounded-xl p-4 transition-all cursor-pointer hover:border-orange-500 ${
                activeFilter === 'pendiente_entrega' 
                  ? 'border-orange-500 ring-2 ring-orange-500/20' 
                  : 'border-[var(--border)]'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-[var(--text)]">Por Entregar</p>
                  <p className="text-2xl font-bold text-[var(--text-h)]">{pendingDeliveryRequests.length}</p>
                </div>
              </div>
              <p className="text-xs text-[var(--text)]">Esperando entrega</p>
            </button>
          </div>

          {(activeFilter === 'all' || activeFilter === 'incompleta') && pendingSignRequests.length > 0 && (
            <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <h2 className="text-lg font-semibold text-[var(--text-h)]">
                  Pendientes de Firma
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                  {pendingSignRequests.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingSignRequests.map(req => (
                  <RequestCard
                    key={req.id}
                    request={req}
                    onSign={handleOpenSignatureModal}
                    onConfirmDelivery={handleConfirmDelivery}
                  />
                ))}
              </div>
            </div>
          )}

          {(activeFilter === 'all' || activeFilter === 'pendiente_compra') && pendingPurchaseRequests.length > 0 && (
            <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <h2 className="text-lg font-semibold text-[var(--text-h)]">
                  Pendientes de Compra
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  {pendingPurchaseRequests.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingPurchaseRequests.map(req => (
                  <RequestCard
                    key={req.id}
                    request={req}
                    onSign={handleOpenSignatureModal}
                    onConfirmDelivery={handleConfirmDelivery}
                  />
                ))}
              </div>
            </div>
          )}

          {(activeFilter === 'all' || activeFilter === 'pendiente_entrega') && pendingDeliveryRequests.length > 0 && (
            <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <h2 className="text-lg font-semibold text-[var(--text-h)]">
                  Pendientes de Entrega
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                  {pendingDeliveryRequests.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingDeliveryRequests.map(req => (
                  <RequestCard
                    key={req.id}
                    request={req}
                    onSign={handleOpenSignatureModal}
                    onConfirmDelivery={handleConfirmDelivery}
                  />
                ))}
              </div>
            </div>
          )}

          {!hasAnyPending && (
            <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-h)] mb-2">
                ¡Todo al día!
              </h3>
              <p className="text-[var(--text)] text-sm">
                No tienes solicitudes pendientes. Puedes crear una desde la sección de Solicitudes.
              </p>
            </div>
          )}
        </>
      )}

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
    </div>
  )
}