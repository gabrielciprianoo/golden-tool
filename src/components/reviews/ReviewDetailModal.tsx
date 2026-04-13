import { Modal } from '../organisms'
import { ToolStateBadge } from './ToolStateBadge'
import { useReview } from '../../hooks/useReviews'
import { formatDate } from '../../utils/toolUtils'
import type { Review } from '../../schemas/reviewSchema'

interface ReviewDetailModalProps {
  reviewId: number
  onClose: () => void
}

export const ReviewDetailModal = ({ reviewId, onClose }: ReviewDetailModalProps) => {
  const { data: review, isLoading } = useReview(reviewId)

  const workerName = review
    ? `${review.worker?.name ?? ''} ${review.worker?.lastname ?? ''}`.trim()
    : ''

  return (
    <Modal isOpen onClose={onClose} title="Detalle de revisión" size="xl">
      {isLoading && (
        <p className="text-[var(--text)] text-sm text-center py-8">Cargando...</p>
      )}

      {review && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-[var(--text)]">
            <span><span className="font-medium text-[var(--text-h)]">Revisión:</span> {review.name}</span>
            <span><span className="font-medium text-[var(--text-h)]">Trabajador:</span> {workerName}</span>
            <span><span className="font-medium text-[var(--text-h)]">Fecha:</span> {formatDate(review.created_at)}</span>
          </div>

          <table className="w-full text-sm border border-[var(--border)] rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-[var(--surface-50)] dark:bg-[var(--surface-800)] border-b border-[var(--border)]">
                <th className="text-left px-4 py-3 font-semibold text-[var(--text-h)]">Herramienta</th>
                <th className="text-left px-4 py-3 font-semibold text-[var(--text-h)]">Estado anterior</th>
                <th className="text-left px-4 py-3 font-semibold text-[var(--text-h)]">Estado actual</th>
                <th className="text-left px-4 py-3 font-semibold text-[var(--text-h)]">Resultado</th>
              </tr>
            </thead>
            <tbody>
              {(review.review_items ?? []).map((item) => (
                <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3 font-medium text-[var(--text-h)]">
                    {item.tool?.name ?? `#${item.tool_id}`}
                  </td>
                  <td className="px-4 py-3">
                    <ToolStateBadge state={item.previous_state} />
                  </td>
                  <td className="px-4 py-3">
                    {item.new_state
                      ? <ToolStateBadge state={item.new_state} />
                      : <ToolStateBadge state="perdida" />}
                  </td>
                  <td className="px-4 py-3">
                    <ResultBadge previousState={item.previous_state} newState={item.new_state ?? null} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <SummaryRow review={review} />
        </div>
      )}
    </Modal>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ResultBadge = ({ previousState, newState }: { previousState: string; newState: string | null }) => {
  if (newState === null) {
    return <span className="text-xs font-medium text-red-600 dark:text-red-400">Perdida</span>
  }
  if (previousState === newState) {
    return <span className="text-xs font-medium text-green-600 dark:text-green-400">Sin cambios</span>
  }
  return <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">Estado actualizado</span>
}

const SummaryRow = ({ review }: { review: Review }) => {
  const items = review.review_items ?? []
  const lost = items.filter((i) => i.new_state === null).length
  const changed = items.filter((i) => i.new_state !== null && i.new_state !== i.previous_state).length

  return (
    <div className="flex gap-4 text-sm pt-1">
      <span className="text-[var(--text)]">{items.length} herramienta{items.length !== 1 ? 's' : ''} revisada{items.length !== 1 ? 's' : ''}</span>
      {lost > 0 && <span className="text-red-600 dark:text-red-400 font-medium">{lost} perdida{lost !== 1 ? 's' : ''}</span>}
      {changed > 0 && <span className="text-yellow-600 dark:text-yellow-400 font-medium">{changed} con cambio de estado</span>}
    </div>
  )
}

