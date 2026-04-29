import { useState } from 'react'
import { Modal } from '../../components/organisms'
import { useAssignmentsByWorker } from '../../hooks/useAssignments'
import { useRequestsByWorker } from '../../hooks/useRequests'
import { type Worker, type Assignment } from '../../types/worker'
import { formatAreaLabel, getStateLabel, getStateStyle, formatDate as formatDateUtil } from '../../utils/toolUtils'
import { RequestHistoryModal } from './RequestHistoryModal'

interface WorkerDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  worker: Worker | null
}

interface ToolGroup {
  tool_id: number
  toolName: string
  assignments: Assignment[]
}

function groupByTool(assignments: Assignment[]): ToolGroup[] {
  const map = new Map<number, ToolGroup>()
  for (const a of assignments) {
    const existing = map.get(a.tool_id)
    const toolName = a.tool?.name ?? `Herramienta #${a.tool_id}`
    if (existing) {
      existing.assignments.push(a)
    } else {
      map.set(a.tool_id, { tool_id: a.tool_id, toolName, assignments: [a] })
    }
  }
  return Array.from(map.values())
}

export const WorkerDetailsModal = ({ isOpen, onClose, worker }: WorkerDetailsModalProps) => {
  const numericWorkerId = worker ? Number(worker.id) : 0
  const { data: assignments = [], isLoading } = useAssignmentsByWorker(numericWorkerId)
  const { data: requests = [] } = useRequestsByWorker(numericWorkerId)
  const [expandedToolId, setExpandedToolId] = useState<number | null>(null)
  const [showRequests, setShowRequests] = useState(false)

  if (!worker) return null

  const groups = groupByTool(assignments as Assignment[])
  const totalUnits = assignments.length

  const pendingRequests = requests.filter(r => r.state === 'pendiente').length
  const inProgressRequests = requests.filter(r => r.state === 'en_proceso').length

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} title="Detalles del Trabajador" size="lg">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-[var(--text)]">Código</p>
            <p className="font-semibold text-[var(--text-h)]">{worker.worker_code}</p>
          </div>
          <div>
            <p className="text-sm text-[var(--text)]">Área</p>
            <p className="font-semibold text-[var(--text-h)]">{formatAreaLabel(worker.area)}</p>
          </div>
          <div>
            <p className="text-sm text-[var(--text)]">Nombre</p>
            <p className="font-semibold text-[var(--text-h)]">{worker.name}</p>
          </div>
          <div>
            <p className="text-sm text-[var(--text)]">Apellidos</p>
            <p className="font-semibold text-[var(--text-h)]">{worker.lastname}</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-[var(--text-h)] mb-3">
            Herramientas Asignadas ({totalUnits} unidad{totalUnits !== 1 ? 'es' : ''} · {groups.length} tipo{groups.length !== 1 ? 's' : ''})
          </h4>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : groups.length === 0 ? (
            <p className="text-[var(--text)] text-sm py-4 text-center">
              Este trabajador no tiene herramientas asignadas
            </p>
          ) : (
            <div className="border border-[var(--border)] rounded-lg overflow-hidden divide-y divide-[var(--border)]">
              {groups.map((group) => {
                const isExpanded = expandedToolId === group.tool_id
                const count = group.assignments.length
                const states = [...new Set(group.assignments.map((a) => a.state))]
                const allSameState = states.length === 1

                return (
                  <div key={group.tool_id}>
                    {/* Group header row */}
                    <button
                      onClick={() => setExpandedToolId(isExpanded ? null : group.tool_id)}
                      className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-[var(--accent-bg)] transition-colors"
                    >
                      <span className="text-[var(--text)] text-sm w-4 shrink-0 font-mono">
                        {isExpanded ? '▾' : '▸'}
                      </span>
                      <span className="flex-1 font-medium text-[var(--text-h)] text-sm">
                        {group.toolName}
                      </span>
                      <span className="text-xs text-[var(--text)] shrink-0">
                        {count} unidad{count !== 1 ? 'es' : ''}
                      </span>
                      {allSameState && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium shrink-0 ${getStateStyle(states[0])}`}>
                          {getStateLabel(states[0])}
                        </span>
                      )}
                      {!allSameState && (
                        <span className="text-xs text-yellow-600 dark:text-yellow-400 shrink-0">
                          Estados mixtos
                        </span>
                      )}
                    </button>

                    {/* Accordion: individual units */}
                    {isExpanded && (
                      <div className="bg-[var(--surface-50)] dark:bg-[var(--surface-800)] divide-y divide-[var(--border)]">
                        {group.assignments.map((a, i) => (
                          <div key={a.id} className="flex items-center gap-4 px-4 py-2 pl-9 text-sm">
                            <span className="text-[var(--text)] w-16 shrink-0">Unidad {i + 1}</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStateStyle(a.state)}`}>
                              {getStateLabel(a.state)}
                            </span>
                            <span className="text-[var(--text)] ml-auto text-xs">
                              {formatDateUtil(a.date)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-2 text-sm">
            {pendingRequests > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                {pendingRequests} pendiente{pendingRequests !== 1 ? 's' : ''}
              </span>
            )}
            {inProgressRequests > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                {inProgressRequests} en proceso
              </span>
            )}
          </div>
          <button
            onClick={() => setShowRequests(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent-bg)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-colors"
          >
            Ver Solicitudes
          </button>
        </div>
      </div>
    </Modal>

    <RequestHistoryModal
      isOpen={showRequests}
      onClose={() => setShowRequests(false)}
      worker={worker}
    />
    </>
  )
}
