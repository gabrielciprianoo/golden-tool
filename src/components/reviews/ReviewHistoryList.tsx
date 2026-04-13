import { useMemo, useState } from 'react'
import { Input } from '../atoms'
import { useReviews } from '../../hooks/useReviews'
import { formatDate } from '../../utils/toolUtils'
import { ReviewDetailModal } from './ReviewDetailModal'
import type { Review } from '../../schemas/reviewSchema'

interface WorkerGroup {
  workerId: number
  workerName: string
  workerCode: string
  reviews: Review[]
}

function groupByWorker(reviews: Review[]): WorkerGroup[] {
  const map = new Map<number, WorkerGroup>()
  for (const r of reviews) {
    const existing = map.get(r.worker_id)
    if (existing) {
      existing.reviews.push(r)
    } else {
      map.set(r.worker_id, {
        workerId: r.worker_id,
        workerName: r.worker ? `${r.worker.name} ${r.worker.lastname}` : `#${r.worker_id}`,
        workerCode: r.worker?.worker_code ?? '',
        reviews: [r],
      })
    }
  }
  return Array.from(map.values())
}

export const ReviewHistoryList = () => {
  const { data: reviews = [], isLoading } = useReviews()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [expandedWorkers, setExpandedWorkers] = useState<Set<number>>(new Set())

  const groups = useMemo(() => {
    const q = search.toLowerCase().trim()
    const filtered = q
      ? reviews.filter((r) => {
          const name = r.worker ? `${r.worker.name} ${r.worker.lastname}`.toLowerCase() : ''
          return r.name.toLowerCase().includes(q) || name.includes(q)
        })
      : reviews
    return groupByWorker(filtered)
  }, [reviews, search])

  const toggleWorker = (id: number) => {
    setExpandedWorkers((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-14 bg-[var(--bg)] border border-[var(--border)] rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-12 text-center">
        <p className="text-base font-semibold text-[var(--text-h)] mb-1">Sin revisiones registradas</p>
        <p className="text-[var(--text)] text-sm">Las revisiones completadas aparecerán aquí.</p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text)] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <Input
            placeholder="Buscar por revisión o trabajador..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {search && (
          <p className="text-sm text-[var(--text)] shrink-0">
            {groups.reduce((acc, g) => acc + g.reviews.length, 0)} de {reviews.length} revisiones
          </p>
        )}
      </div>

      {groups.length === 0 ? (
        <p className="text-[var(--text)] text-sm">No se encontraron resultados para "{search}".</p>
      ) : (
        <div className="space-y-2">
          {groups.map((group) => {
            const isExpanded = expandedWorkers.has(group.workerId)
            return (
              <div key={group.workerId} className="bg-[var(--bg)] border border-[var(--border)] rounded-xl overflow-hidden">
                {/* Worker header */}
                <button
                  onClick={() => toggleWorker(group.workerId)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-[var(--surface-50)] dark:hover:bg-[var(--surface-800)] transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-primary-600 dark:bg-primary-500 flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">
                      {group.workerName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[var(--text-h)] truncate">{group.workerName}</p>
                    {group.workerCode && (
                      <p className="text-xs text-[var(--text)] font-mono">{group.workerCode}</p>
                    )}
                  </div>
                  <span className="text-xs font-medium text-[var(--text)] shrink-0">
                    {group.reviews.length} revisión{group.reviews.length !== 1 ? 'es' : ''}
                  </span>
                  <svg
                    className={`w-4 h-4 text-[var(--text)] shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Reviews list */}
                {isExpanded && (
                  <div className="border-t border-[var(--border)] divide-y divide-[var(--border)]">
                    {group.reviews.map((review) => (
                      <ReviewRow key={review.id} review={review} onSelect={() => setSelectedId(review.id)} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {selectedId !== null && (
        <ReviewDetailModal reviewId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </>
  )
}

// ─── Review row ───────────────────────────────────────────────────────────────

const ReviewRow = ({ review, onSelect }: { review: Review; onSelect: () => void }) => {
  const items = review.review_items ?? []
  const lostCount = items.filter((i) => i.new_state === null).length
  const total = items.length

  return (
    <div
      onClick={onSelect}
      className="flex items-center gap-4 px-5 py-3.5 pl-16 hover:bg-[var(--surface-50)] dark:hover:bg-[var(--surface-800)] cursor-pointer transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-h)] truncate">{review.name}</p>
        <p className="text-xs text-[var(--text)]">{formatDate(review.created_at)}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {total > 0 && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500 text-white">
            {total - lostCount}/{total} presentes
          </span>
        )}
        {lostCount > 0 && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-500 text-white">
            {lostCount} perdida{lostCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <svg className="w-4 h-4 text-[var(--text)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  )
}

