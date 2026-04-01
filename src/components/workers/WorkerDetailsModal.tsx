import { useMemo } from 'react'
import { Modal } from '../../components/organisms'
import { useAssignmentsByWorker } from '../../hooks/useAssignments'
import { useTools } from '../../hooks/useTools'
import { TOOL_STATES, type Worker } from '../../types/worker'

interface WorkerDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  worker: Worker | null
}

export const WorkerDetailsModal = ({ isOpen, onClose, worker }: WorkerDetailsModalProps) => {
  const { data: assignments = [] } = useAssignmentsByWorker(worker ? Number(worker.id) : 0)
  const { tools = [] } = useTools()

    console.log("ASSIGNMENTS:", assignments)


  const toolsMap = useMemo(() => {
    const map = new Map<number, typeof tools[0]>()
    tools.forEach((t) => map.set(Number(t.id), t))
    return map
  }, [tools])

  const getToolName = (toolId: number) => {
    return toolsMap.get(toolId)?.name ?? `Herramienta #${toolId}`
  }

  const getStateLabel = (state: string) => {
    const found = TOOL_STATES.find((s) => s.value === state)
    return found?.label ?? state
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  if (!worker) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalles del Trabajador"
      size="lg"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-[var(--text)]">Código</p>
            <p className="font-semibold text-[var(--text-h)]">{worker.worker_code}</p>
          </div>
          <div>
            <p className="text-sm text-[var(--text)]">Área</p>
            <p className="font-semibold text-[var(--text-h)]">
              {worker.area === 'montaje/desmontaje' ? 'Montaje / Desmontaje' : 'Armado / Desarmado'}
            </p>
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
            Herramientas Asignadas ({assignments.length})
          </h4>
          
          {assignments.length === 0 ? (
            <p className="text-[var(--text)] text-sm py-4 text-center">
              Este trabajador no tiene herramientas asignadas
            </p>
          ) : (
            <div className="overflow-x-auto border border-[var(--border)] rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-[var(--surface-50)] dark:bg-[var(--surface-800)] border-b border-[var(--border)]">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-[var(--text-h)]">Herramienta</th>
                    <th className="px-4 py-2 text-center font-medium text-[var(--text-h)]">Cantidad</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--text-h)]">Estado</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--text-h)]">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assignment) => (
                    <tr key={assignment.id} className="border-b border-[var(--border)]">
                      <td className="px-4 py-2 text-[var(--text-h)]">{getToolName(assignment.tool_id)}</td>
                      <td className="px-4 py-2 text-center text-[var(--text)]">{assignment.assigned_quantity}</td>
                      <td className="px-4 py-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-surface-100 text-surface-700 dark:bg-surface-700 dark:text-surface-200">
                          {getStateLabel(assignment.state)}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-[var(--text)]">{formatDate(assignment.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}